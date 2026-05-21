export async function health() {
  // Optional: ping Firestore with a read
  return { ok: true, app: "Qatra Firebase", provider: "firebase" };
}
