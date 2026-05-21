import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet } from "lucide-react";
import { mockApi } from "../api/mockApi";
import { useAuthStore, ROLE_LABELS } from "../store/authStore";

const ROLES = [
  { id: "manager", label: ROLE_LABELS.manager },
  { id: "cra", label: ROLE_LABELS.cra },
  { id: "admin", label: ROLE_LABELS.admin },
  { id: "medical", label: ROLE_LABELS.medical },
];

export default function Login() {
  const [email, setEmail] = useState("manager@chu-alger.dz");
  const [password, setPassword] = useState("demo");
  const [role, setRole] = useState("manager");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const getDefaultRoute = useAuthStore((s) => s.getDefaultRoute);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, token } = await mockApi.login(email, password, role);
      login({ ...user, role }, token);
      navigate(getDefaultRoute());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary text-white">
            <Droplet className="h-8 w-8 fill-white" />
          </div>
          <h1 className="text-2xl font-medium text-primary">BloodSync</h1>
          <p className="mt-1 text-sm text-gray-500">Nexus de Distribution Sanguine</p>
          <p className="mt-2 text-xs text-gray-400">Ecosystem partner: قطرة Qatra</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Password</label>
            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">Role</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2.5 text-sm ${
                    role === r.id ? "border-primary bg-primary-light" : "border-border"
                  }`}
                >
                  <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-[10px] text-gray-400">Demo: any password · JWT simulated in localStorage</p>
      </div>
    </div>
  );
}
