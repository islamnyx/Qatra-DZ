/**
 * Central app configuration from environment variables.
 * Copy .env.example → .env.local and adjust per developer/team.
 */

export function isFirebaseEnabled() {
  return import.meta.env.VITE_DATA_PROVIDER === "firebase";
}

export function getApiBase() {
  return import.meta.env.VITE_API_URL || "/api";
}

export const DEMO_DONOR_ID = "DZ-001";
