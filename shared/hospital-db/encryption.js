/**
 * Client-side AES-256-GCM encryption for pre_screening.encrypted_medical_answers.
 * Production: replace key derivation with HSM / native module (C/Assembly) before upload.
 */

const VERSION = 1;
const ALGO = "AES-GCM";
const IV_LENGTH = 12;

function textEncoder() {
  return new TextEncoder();
}

async function importKeyFromSecret(secret) {
  const raw = textEncoder().encode(secret.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", raw, { name: ALGO }, false, ["encrypt", "decrypt"]);
}

/**
 * Encrypt JSON answers object → base64 ciphertext stored in Firestore.
 * @param {object} answers — medications, conditions, travel, etc.
 * @param {string} secret — VITE_PRESCREENING_KEY (32+ chars recommended)
 */
export async function encryptMedicalAnswers(answers, secret) {
  if (!secret || secret.length < 16) {
    throw new Error("PRESCREENING encryption key missing or too short");
  }
  const key = await importKeyFromSecret(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintext = textEncoder().encode(JSON.stringify(answers));
  const cipher = await crypto.subtle.encrypt({ name: ALGO, iv }, key, plaintext);
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return {
    encrypted_medical_answers: btoa(String.fromCharCode(...combined)),
    encryption_version: VERSION,
  };
}

/**
 * Decrypt ciphertext for hospital medical validation (staff only).
 */
export async function decryptMedicalAnswers(ciphertextBase64, secret) {
  const key = await importKeyFromSecret(secret);
  const combined = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);
  const plain = await crypto.subtle.decrypt({ name: ALGO, iv }, key, data);
  return JSON.parse(new TextDecoder().decode(plain));
}
