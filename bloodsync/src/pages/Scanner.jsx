import { useState } from "react";
import { ScanLine } from "lucide-react";
import { api } from "../api";

const DEMO_KEY = "qatra-prescreen-demo-key-32chars!!";
const DEMO_HASH = "DONOR-DEMO-001";

export default function Scanner() {
  const [donorHash, setDonorHash] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const secret = import.meta.env.VITE_PRESCREENING_KEY || DEMO_KEY;

  const lookup = async () => {
    const id = donorHash.trim();
    if (!id) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.getPreScreeningDecrypted(id, secret);
      if (!data) {
        setError("No pre-screening record for this donor hash.");
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e.message || "Decryption failed — check VITE_PRESCREENING_KEY");
    } finally {
      setLoading(false);
    }
  };

  const seedDemo = async () => {
    setLoading(true);
    setError("");
    try {
      if (api.seedDemoPreScreening) {
        await api.seedDemoPreScreening(DEMO_HASH, secret, {
          medications: ["None"],
          chronic_conditions: ["None"],
          travel_last_3_months: false,
          recent_surgery: false,
        });
        setDonorHash(DEMO_HASH);
        setResult(null);
        alert("Demo record created. Click Validate to view.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="card p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary-light text-primary">
          <ScanLine className="h-8 w-8" />
        </div>
        <h1 className="text-lg font-medium">Pre-screening validation</h1>
        <p className="mt-2 text-xs text-gray-500">
          Enter donor hash (Firebase Auth UID). Answers are stored encrypted — names are never saved.
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <label className="block text-xs font-medium text-gray-600">Donor hash / UID</label>
        <input
          className="input-field font-mono text-sm"
          placeholder="e.g. Firebase Auth UID"
          value={donorHash}
          onChange={(e) => setDonorHash(e.target.value)}
        />
        <div className="flex gap-2">
          <button type="button" className="btn-primary flex-1" disabled={loading} onClick={lookup}>
            {loading ? "Loading…" : "Validate record"}
          </button>
          {api.seedDemoPreScreening && (
            <button type="button" className="rounded-[10px] border border-border px-3 text-xs" onClick={seedDemo}>
              Seed demo
            </button>
          )}
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      {result && (
        <div className="card p-5">
          <h2 className="text-sm font-medium text-gray-700">Decrypted answers (medical team only)</h2>
          <p className="mt-1 font-mono text-xs text-gray-400">Hash: {result.donor_hash}</p>
          <pre className="mt-3 max-h-64 overflow-auto rounded-[10px] bg-surface p-3 text-xs">
            {JSON.stringify(result.answers, null, 2)}
          </pre>
          {result.submitted_at && (
            <p className="mt-2 text-xs text-gray-500">Submitted: {result.submitted_at}</p>
          )}
        </div>
      )}
    </div>
  );
}
