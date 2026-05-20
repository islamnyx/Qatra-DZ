# Qatra-DZ Hospital Backend

A secure Flask backend for the Qatra-DZ donor application. This service exposes REST APIs for donor profiles, SOS requests, family vault data, and campaign updates, while integrating a low-level C/Assembly security layer for request integrity and secure memory wiping.

## Setup

1. Open a terminal in `hospital_backend`.
2. Install Python dependencies:

   pip install -r requirements.txt

3. Compile the security library:

   cd security
   bash compile.sh

   - On Linux/macOS this generates `libcrypto_core.so`
   - On Windows Git Bash/MSYS it generates `crypto_core.dll`

4. Start the Flask server:

   python app.py

The server listens at `http://127.0.0.1:5000`.

## Available API Endpoints

- `GET /api/donor`
- `GET /api/donor/passport`
- `GET /api/family`
- `GET /api/sos`
- `GET /api/sos/urgent`
- `GET /api/wilaya`
- `GET /api/leaderboard`
- `GET /api/news`
- `GET /api/history`
- `GET /api/badges`
- `GET /api/chat/prompts`
- `POST /api/sos/respond`
- `POST /api/sos/share`
- `POST /api/campaign/interest`
- `GET /api/health`

## Security Logic

- Incoming JSON POST requests are validated with a SHA-256 signature over the payload plus a server secret.
- A native C library performs a custom integrity checksum and secure memory wipe for sensitive request content.
- HTTP response headers enforce safe browsing and content policies.

## How it works

- The Flask app keeps the dataset in `database.json` and returns structured donor and SOS data for the frontend.
- The security library is compiled from `crypto_core.c` and `asm_helpers.asm`.
- The Python app loads the library with `ctypes` and uses its `secure_xor_checksum` and `secure_wipe` functions during request validation.

## Notes for the frontend

The current frontend can consume this backend by replacing local data imports with fetch requests to the endpoints above. The secure POST endpoints expect a JSON body with `payload` and `signature` fields.
