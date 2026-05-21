import { useEffect, useState, useMemo } from "react";
import { mockApi } from "../api/mockApi";
import HospitalPanel from "../components/HospitalPanel";
import { useAuthStore } from "../store/authStore";

export default function Inventory() {
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [wilaya, setWilaya] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("hospital");
  const [sortDir, setSortDir] = useState(1);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    mockApi.getHospitals().then(setHospitals);
  }, []);

  const rows = useMemo(() => {
    const flat = [];
    for (const h of hospitals) {
      for (const s of h.stock) {
        flat.push({
          hospitalId: h.id,
          hospital: h.name,
          wilaya: h.wilaya,
          type: s.type,
          units: s.units,
          optimal: s.optimal,
          fill: Math.round((s.units / s.optimal) * 100),
          expiry: s.expiryAlert ?? "—",
          updated: "2026-05-21",
          hospitalObj: h,
        });
      }
    }
    return flat
      .filter((r) => (!wilaya || r.wilaya === wilaya) && (!typeFilter || r.type === typeFilter))
      .sort((a, b) => (a[sortKey] > b[sortKey] ? sortDir : -sortDir));
  }, [hospitals, wilaya, typeFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const exportCsv = () => {
    const header = "Hospital,Wilaya,Type,Units,Optimal,Fill%,Expiry\n";
    const body = rows.map((r) => `${r.hospital},${r.wilaya},${r.type},${r.units},${r.optimal},${r.fill},${r.expiry}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bloodsync-inventory.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select className="input-field w-auto text-sm" value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
          <option value="">All wilayas</option>
          {[...new Set(hospitals.map((h) => h.wilaya))].map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
        <select className="input-field w-auto text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button type="button" onClick={exportCsv} className="rounded-[10px] border border-border px-4 py-2 text-sm">
          Export CSV
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-gray-500">
            <tr>
              {[
                ["hospital", "Hospital"],
                ["wilaya", "Wilaya"],
                ["type", "Blood Type"],
                ["units", "Units"],
                ["optimal", "Optimal"],
                ["fill", "Fill%"],
                ["expiry", "Expiry Next"],
                ["updated", "Last Updated"],
              ].map(([key, label]) => (
                <th key={key} className="cursor-pointer p-3 text-left" onClick={() => toggleSort(key)}>
                  {label} {sortKey === key ? (sortDir > 0 ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-border cursor-pointer hover:bg-surface"
                onClick={() => setSelected(row.hospitalObj)}
              >
                <td className="p-3 font-medium">{row.hospital}</td>
                <td className="p-3">{row.wilaya}</td>
                <td className="p-3">{row.type}</td>
                <td className="p-3">
                  {role === "manager" ? (
                    <input
                      type="number"
                      className="input-field w-16 py-1 text-xs"
                      defaultValue={row.units}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    row.units
                  )}
                </td>
                <td className="p-3">{row.optimal}</td>
                <td className={`p-3 font-medium ${row.fill < 30 ? "text-danger" : row.fill < 70 ? "text-warning" : "text-success"}`}>
                  {row.fill}%
                </td>
                <td className="p-3">{row.expiry}</td>
                <td className="p-3 text-gray-500">{row.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <HospitalPanel hospital={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
