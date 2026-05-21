import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "../api";
import HospitalPanel from "../components/HospitalPanel";
import { useAuthStore } from "../store/authStore";

const STATUS_LABELS = {
  available: "Available",
  expired: "Expired",
  reserved: "Reserved",
};

export default function Inventory() {
  const [units, setUnits] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [wilaya, setWilaya] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState("expiration_date");
  const [sortDir, setSortDir] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = useAuthStore((s) => s.user?.role);
  const hospitalId = useAuthStore((s) => s.user?.hospital_id);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [inv, hos] = await Promise.all([
        api.listBloodInventory(hospitalId && role === "manager" ? { hospital_id: hospitalId } : {}),
        api.getHospitals(),
      ]);
      setUnits(inv);
      setHospitals(hos);
    } catch (e) {
      setError(e.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [hospitalId, role]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    return units
      .map((u) => ({
        unit_id: u.unit_id,
        hospital: u.hospital_name || u.hospital_id,
        wilaya: u.wilaya,
        type: u.blood_type,
        component: u.component_type,
        donation: u.donation_date,
        expiration: u.expiration_date,
        status: u.status,
        hospitalObj: hospitals.find((h) => h.id === u.hospital_id),
      }))
      .filter(
        (r) =>
          (!wilaya || r.wilaya === wilaya) &&
          (!typeFilter || r.type === typeFilter) &&
          (!statusFilter || r.status === statusFilter)
      )
      .sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        return av > bv ? sortDir : av < bv ? -sortDir : 0;
      });
  }, [units, hospitals, wilaya, typeFilter, statusFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const exportCsv = () => {
    const header = "Unit ID,Hospital,Wilaya,Blood Type,Component,Donation,Expiration,Status\n";
    const body = rows
      .map(
        (r) =>
          `${r.unit_id},${r.hospital},${r.wilaya},${r.type},${r.component},${r.donation},${r.expiration},${r.status}`
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bloodsync-blood-inventory.csv";
    a.click();
  };

  const onStatusChange = async (unitId, status) => {
    try {
      await api.updateBloodUnit(unitId, { status });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading blood inventory…</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Unit-level tracking — each row is one blood bag (RBC shelf life 42 days, Platelets 5 days).
      </p>
      {error && (
        <p className="rounded-[10px] bg-primary-light px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <select className="input-field w-auto text-sm" value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
          <option value="">All wilayas</option>
          {[...new Set(units.map((u) => u.wilaya).filter(Boolean))].map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
        <select className="input-field w-auto text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          className="input-field w-auto text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" onClick={exportCsv} className="rounded-[10px] border border-border px-4 py-2 text-sm">
          Export CSV
        </button>
        <button type="button" onClick={load} className="rounded-[10px] border border-border px-4 py-2 text-sm">
          Refresh
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-gray-500">
            <tr>
              {[
                ["unit_id", "Unit ID"],
                ["hospital", "Hospital"],
                ["wilaya", "Wilaya"],
                ["type", "Blood Type"],
                ["component", "Component"],
                ["donation", "Donation"],
                ["expiration", "Expiration"],
                ["status", "Status"],
              ].map(([key, label]) => (
                <th key={key} className="cursor-pointer p-3 text-left" onClick={() => toggleSort(key)}>
                  {label} {sortKey === key ? (sortDir > 0 ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.unit_id}
                className="border-t border-border cursor-pointer hover:bg-surface"
                onClick={() => row.hospitalObj && setSelected(row.hospitalObj)}
              >
                <td className="p-3 font-mono text-xs">{row.unit_id}</td>
                <td className="p-3 font-medium">{row.hospital}</td>
                <td className="p-3">{row.wilaya}</td>
                <td className="p-3">{row.type}</td>
                <td className="p-3">{row.component}</td>
                <td className="p-3">{row.donation}</td>
                <td className={`p-3 ${row.status === "expired" ? "text-danger font-medium" : ""}`}>{row.expiration}</td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  {role === "manager" ? (
                    <select
                      className="input-field py-1 text-xs"
                      value={row.status}
                      onChange={(e) => onStatusChange(row.unit_id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    STATUS_LABELS[row.status] ?? row.status
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No units match filters.</p>}
      </div>

      {selected && <HospitalPanel hospital={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
