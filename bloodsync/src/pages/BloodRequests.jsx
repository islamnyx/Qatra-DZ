import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuthStore } from "../store/authStore";
import { URGENCY_LEVEL, REQUEST_STATUS, COMPONENT_TYPES, BLOOD_TYPES } from "@shared/hospital-db/schema.js";

const URGENCY_LABELS = { CRITICAL: "Critical", MEDIUM: "Medium" };
const STATUS_LABELS = { pending: "Pending", fulfilled: "Fulfilled" };

export default function BloodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const user = useAuthStore((s) => s.user);
  const canEdit = ["manager", "admin", "medical"].includes(user?.role);

  const [form, setForm] = useState({
    required_blood_type: "O-",
    required_component: COMPONENT_TYPES.RBC,
    quantity_needed: 1,
    urgency_level: URGENCY_LEVEL.CRITICAL,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await api.listBloodRequests(
        user?.hospital_id && user?.role === "manager" ? { hospital_id: user.hospital_id } : {}
      );
      setRequests(rows);
    } catch (e) {
      setError(e.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [user?.hospital_id, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      await api.createBloodRequest({
        hospital_id: user?.hospital_id || "h1",
        hospital_name: "CHU Mustapha Pacha",
        wilaya: "Alger",
        ...form,
        quantity_needed: Number(form.quantity_needed),
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const fulfill = async (requestId) => {
    try {
      await api.updateBloodRequest(requestId, { status: REQUEST_STATUS.FULFILLED });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading SOS / blood requests…</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Hospital-mediated blood requests — no direct donor matching stored here (Golden Rule).
      </p>
      {error && <p className="rounded-[10px] bg-primary-light px-3 py-2 text-sm text-danger">{error}</p>}

      {canEdit && (
        <button type="button" className="btn-primary text-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New urgent request"}
        </button>
      )}

      {showForm && (
        <form onSubmit={submitRequest} className="card grid gap-3 p-4 md:grid-cols-2">
          <label className="text-xs">
            Blood type
            <select
              className="input-field mt-1 w-full"
              value={form.required_blood_type}
              onChange={(e) => setForm((f) => ({ ...f, required_blood_type: e.target.value }))}
            >
              {BLOOD_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Component
            <select
              className="input-field mt-1 w-full"
              value={form.required_component}
              onChange={(e) => setForm((f) => ({ ...f, required_component: e.target.value }))}
            >
              <option value={COMPONENT_TYPES.RBC}>RBC (42d shelf)</option>
              <option value={COMPONENT_TYPES.PLATELETS}>Platelets (5d shelf)</option>
            </select>
          </label>
          <label className="text-xs">
            Quantity
            <input
              type="number"
              min={1}
              max={99}
              className="input-field mt-1 w-full"
              value={form.quantity_needed}
              onChange={(e) => setForm((f) => ({ ...f, quantity_needed: e.target.value }))}
            />
          </label>
          <label className="text-xs">
            Urgency
            <select
              className="input-field mt-1 w-full"
              value={form.urgency_level}
              onChange={(e) => setForm((f) => ({ ...f, urgency_level: e.target.value }))}
            >
              <option value={URGENCY_LEVEL.CRITICAL}>{URGENCY_LABELS.CRITICAL}</option>
              <option value={URGENCY_LEVEL.MEDIUM}>{URGENCY_LABELS.MEDIUM}</option>
            </select>
          </label>
          <button type="submit" className="btn-primary md:col-span-2">
            Submit request
          </button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-gray-500">
            <tr>
              <th className="p-3 text-left">Request ID</th>
              <th className="p-3 text-left">Hospital</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Component</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Urgency</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.request_id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{r.request_id}</td>
                <td className="p-3">{r.hospital_name}</td>
                <td className="p-3 font-medium">{r.required_blood_type}</td>
                <td className="p-3">{r.required_component}</td>
                <td className="p-3">{r.quantity_needed}</td>
                <td className={`p-3 ${r.urgency_level === "CRITICAL" ? "text-danger font-medium" : ""}`}>
                  {URGENCY_LABELS[r.urgency_level]}
                </td>
                <td className="p-3">{STATUS_LABELS[r.status]}</td>
                <td className="p-3">
                  {canEdit && r.status === REQUEST_STATUS.PENDING && (
                    <button
                      type="button"
                      className="text-xs text-primary font-medium"
                      onClick={() => fulfill(r.request_id)}
                    >
                      Mark fulfilled
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">No active requests.</p>
        )}
      </div>
    </div>
  );
}
