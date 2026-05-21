import { Fragment, useEffect, useState } from "react";
import { mockApi } from "../api/mockApi";
import { useAuthStore } from "../store/authStore";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-warning border-amber-200",
  Approved: "bg-green-50 text-success border-green-200",
  Rejected: "bg-primary-light text-danger border-red-200",
  "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
};

export default function Transfers() {
  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    mockApi.getTransfers().then(setRows);
  }, []);

  const filtered = statusFilter ? rows.filter((r) => r.status === statusFilter) : rows;

  const updateStatus = async (id, status) => {
    await mockApi.patchTransfer(id, status);
    setRows(await mockApi.getTransfers());
  };

  return (
    <div className="space-y-4">
      <select className="input-field w-auto text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All statuses</option>
        {Object.keys(STATUS_STYLES).map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-gray-500">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">From</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3">Type</th>
              <th className="p-3">Units</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <Fragment key={row.id}>
                <tr className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{row.id}</td>
                  <td className="p-3">{row.from}</td>
                  <td className="p-3">{row.to}</td>
                  <td className="p-3 font-medium">{row.type}</td>
                  <td className="p-3">{row.units}</td>
                  <td className="p-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{row.date}</td>
                  <td className="p-3">
                    <button type="button" className="text-xs text-primary mr-2" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                      {expanded === row.id ? "Hide" : "Details"}
                    </button>
                    {role === "manager" && row.status === "Pending" && (
                      <>
                        <button type="button" className="text-xs text-success mr-2" onClick={() => updateStatus(row.id, "Approved")}>
                          Approve
                        </button>
                        <button type="button" className="text-xs text-danger" onClick={() => updateStatus(row.id, "Rejected")}>
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr className="bg-surface">
                    <td colSpan={8} className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Timeline</p>
                      <div className="flex gap-2">
                        {row.timeline.map((step, i) => (
                          <span key={i} className="rounded-full bg-white border border-border px-3 py-1 text-xs">
                            {step}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
