import json
import sys
import urllib.error
import urllib.request

BASE_URL = "http://127.0.0.1:5000"
FAMILY_ENDPOINT = "/api/family"
PASSPORT_ENDPOINT = "/api/donor/passport"

EXPECTED_FAMILY_MEMBERS = [
    {"id": "F1", "name": "فاطمة بوعلام", "relationAr": "الأم"},
    {"id": "F2", "name": "بوعلام بن أحمد", "relationAr": "الأب"},
    {"id": "F3", "name": "سارة بوعلام", "relationAr": "الأخت"},
    {"id": "F4", "name": "ياسين بوعلام", "relationAr": "الأخ"},
]

EXPECTED_PASSPORT_PAYLOAD = {
    "app": "Qatra",
    "passportId": "QATRA-DZ-001",
    "donorId": "DZ-001",
    "name": "أمين بوعلام",
    "bloodType": "O-",
    "wilaya": "Alger",
    "eligible": True,
    "lastDonation": "2025-03-10",
    "totalDonations": 7,
    "verified": True,
    "issuer": "Croissant-Rouge Algérien",
    "issuedAt": "2026-05-20",
}


def fetch_json(path):
    url = BASE_URL + path
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as response:
        status = response.getcode()
        raw = response.read()
        payload = json.loads(raw.decode("utf-8"))
    return status, payload


def verify_family(response):
    if not isinstance(response, list):
        raise AssertionError("/api/family did not return a JSON array.")

    names = {item.get("name") for item in response if isinstance(item, dict)}
    missing = [member["name"] for member in EXPECTED_FAMILY_MEMBERS if member["name"] not in names]
    if missing:
        raise AssertionError(f"Missing family members from API response: {', '.join(missing)}")

    expected_ids = {member["id"] for member in EXPECTED_FAMILY_MEMBERS}
    returned_ids = {item.get("id") for item in response if isinstance(item, dict)}
    if not expected_ids.issubset(returned_ids):
        raise AssertionError("/api/family response is not fully bound to the expected dataset IDs.")

    return True


def verify_passport(response):
    if not isinstance(response, dict):
        raise AssertionError("/api/donor/passport did not return a JSON object.")

    for key, expected_value in EXPECTED_PASSPORT_PAYLOAD.items():
        if response.get(key) != expected_value:
            raise AssertionError(
                f"Passport payload mismatch for '{key}': expected '{expected_value}', got '{response.get(key)}'"
            )

    return True


def print_report(results):
    divider = "=" * 60
    print(divider)
    print("HOSPITAL BACKEND FEATURE VERIFICATION REPORT")
    print(divider)

    for feature_name, status, message in results:
        status_label = "SUCCESS" if status else "FAILED"
        print(f"{feature_name:<40} {status_label}")
        if message:
            print(f"    {message}")

    print(divider)
    success_count = sum(1 for _, status, _ in results if status)
    print(f"Summary: {success_count}/{len(results)} checks passed.")
    print(divider)

    if success_count != len(results):
        sys.exit(1)


def main():
    results = []

    try:
        status, payload = fetch_json(FAMILY_ENDPOINT)
        if status != 200:
            raise AssertionError(f"Expected HTTP 200, got {status}.")
        verify_family(payload)
        results.append(("GET /api/family", True, "Family endpoint returned expected dataset."))
    except urllib.error.URLError as exc:
        results.append(("GET /api/family", False, f"Connection failed: {exc.reason if hasattr(exc, 'reason') else exc}"))
    except Exception as exc:
        results.append(("GET /api/family", False, str(exc)))

    try:
        status, payload = fetch_json(PASSPORT_ENDPOINT)
        if status != 200:
            raise AssertionError(f"Expected HTTP 200, got {status}.")
        verify_passport(payload)
        results.append(("GET /api/donor/passport", True, "Passport endpoint returned authentic donor payload."))
    except urllib.error.URLError as exc:
        results.append(("GET /api/donor/passport", False, f"Connection failed: {exc.reason if hasattr(exc, 'reason') else exc}"))
    except Exception as exc:
        results.append(("GET /api/donor/passport", False, str(exc)))

    print_report(results)


if __name__ == "__main__":
    main()
