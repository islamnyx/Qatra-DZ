import hashlib
import hmac
import json
import os
import re
from ctypes import CDLL, POINTER, c_char_p, c_size_t, c_uint64, c_void_p, create_string_buffer
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "database.json")
SECRET_KEY = os.getenv("QATRA_SECRET", "qatra_secure_app_2026")
LIB_CANDIDATES = [
    os.path.join(BASE_DIR, "security", "crypto_core.dll"),
    os.path.join(BASE_DIR, "security", "libcrypto_core.so"),
]

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


def load_crypto_lib():
    for path in LIB_CANDIDATES:
        if os.path.exists(path):
            return CDLL(path)
    raise FileNotFoundError("Secure library not found. Run security/compile.sh first.")

crypto_lib = load_crypto_lib()
crypto_lib.secure_xor_checksum.argtypes = [c_char_p, c_size_t, c_uint64]
crypto_lib.secure_xor_checksum.restype = c_uint64
crypto_lib.secure_wipe.argtypes = [c_void_p, c_size_t]
crypto_lib.secure_wipe.restype = None


def load_data():
    with open(DATA_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def save_data(data):
    with open(DATA_PATH, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)


def canonical_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def sanitize_text(value):
    if not isinstance(value, str):
        return value
    cleaned = re.sub(r"[<>\"'%;()&+\\]", "", value)
    return cleaned.strip()


def sanitize_payload(item):
    if isinstance(item, str):
        return sanitize_text(item)
    if isinstance(item, list):
        return [sanitize_payload(sub) for sub in item]
    if isinstance(item, dict):
        return {sanitize_text(key): sanitize_payload(value) for key, value in item.items()}
    return item


def compute_signature(payload):
    canonical = canonical_json(payload)
    digest = hashlib.sha256((canonical + SECRET_KEY).encode("utf-8")).hexdigest()
    return digest


def secure_checksum(text):
    buffer = create_string_buffer(text.encode("utf-8"))
    checksum = crypto_lib.secure_xor_checksum(buffer, len(buffer), 0xA5A5A5A5A5A5A5A5)
    crypto_lib.secure_wipe(buffer, len(buffer))
    return checksum


def verify_request_body(body):
    if not isinstance(body, dict):
        return None
    payload = body.get("payload")
    signature = body.get("signature")
    if not isinstance(payload, dict) or not isinstance(signature, str):
        return None
    payload = sanitize_payload(payload)
    if not hmac.compare_digest(compute_signature(payload), signature):
        return None
    secure_checksum(canonical_json(payload))
    return payload


@app.after_request
def apply_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; object-src 'none'; frame-ancestors 'none'"
    return response


@app.route("/api/donor", methods=["GET"])
def get_donor():
    data = load_data()
    return jsonify(data["donor"])


@app.route("/api/donor/passport", methods=["GET"])
def get_passport():
    data = load_data()
    return jsonify(data["passportPayload"])


@app.route("/api/family", methods=["GET"])
def get_family():
    data = load_data()
    return jsonify(data["familyMembers"])


@app.route("/api/sos", methods=["GET"])
def get_sos_requests():
    data = load_data()
    return jsonify(data["sosRequests"])


@app.route("/api/sos/urgent", methods=["GET"])
def get_urgent_sos():
    data = load_data()
    sorted_requests = sorted(
        data["sosRequests"],
        key=lambda item: (item["urgency"] != "critical", item["postedAt"]),
    )
    return jsonify(sorted_requests[0] if sorted_requests else {})


@app.route("/api/wilaya", methods=["GET"])
def get_wilaya():
    data = load_data()
    return jsonify(data["wilayaStatus"])


@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    data = load_data()
    return jsonify(data["leaderboard"])


@app.route("/api/news", methods=["GET"])
def get_news():
    data = load_data()
    return jsonify(data["newsFeed"])


@app.route("/api/history", methods=["GET"])
def get_history():
    data = load_data()
    return jsonify(data["donationHistory"])


@app.route("/api/badges", methods=["GET"])
def get_badges():
    data = load_data()
    return jsonify(data["badgeDetails"])


@app.route("/api/chat/prompts", methods=["GET"])
def get_chat_prompts():
    data = load_data()
    return jsonify(data["chatPrompts"])


@app.route("/api/campaign/interest", methods=["POST"])
def update_campaign_interest():
    body = verify_request_body(request.get_json(silent=True))
    if body is None:
        return jsonify({"error": "invalid request"}), 400
    user_id = sanitize_text(body.get("userId", "anonymous"))
    data = load_data()
    data["campaignInterest"] = data.get("campaignInterest", 0) + 1
    data.setdefault("campaignLog", []).append({"userId": user_id, "timestamp": datetime.utcnow().isoformat()})
    save_data(data)
    return jsonify({"campaignInterest": data["campaignInterest"]})


@app.route("/api/sos/respond", methods=["POST"])
def respond_sos():
    body = verify_request_body(request.get_json(silent=True))
    if body is None:
        return jsonify({"error": "invalid request"}), 400
    sos_id = sanitize_text(body.get("sosId"))
    responder = sanitize_text(body.get("responder", "anonymous"))
    data = load_data()
    updated = False
    for request_item in data["sosRequests"]:
        if request_item["id"] == sos_id:
            request_item["responded"] = True
            request_item["responder"] = responder
            request_item["respondedAt"] = datetime.utcnow().isoformat()
            updated = True
    if not updated:
        return jsonify({"error": "sos request not found"}), 404
    save_data(data)
    return jsonify({"status": "responded", "sosId": sos_id})


@app.route("/api/sos/share", methods=["POST"])
def share_sos():
    body = verify_request_body(request.get_json(silent=True))
    if body is None:
        return jsonify({"error": "invalid request"}), 400
    sos_id = sanitize_text(body.get("sosId"))
    data = load_data()
    for request_item in data["sosRequests"]:
        if request_item["id"] == sos_id:
            request_item["shareCount"] = request_item.get("shareCount", 0) + 1
            request_item.setdefault("shareLog", []).append({"timestamp": datetime.utcnow().isoformat()})
            save_data(data)
            return jsonify({"shareCount": request_item["shareCount"], "sosId": sos_id})
    return jsonify({"error": "sos request not found"}), 404


@app.route("/api/health", methods=["GET"])
def health_check():
    data = load_data()
    payload = {
        "status": "ok",
        "items": len(data.get("sosRequests", [])),
        "timestamp": datetime.utcnow().isoformat(),
    }
    integrity = compute_signature(payload)
    checksum = secure_checksum(canonical_json(payload))
    return jsonify({"service": "hospital_backend", "integrity": integrity, "nativeChecksum": checksum, "payload": payload})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
