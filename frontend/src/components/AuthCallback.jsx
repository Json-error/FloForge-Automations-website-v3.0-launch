import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = location.hash || "";
    const sid = new URLSearchParams(hash.replace(/^#/, "")).get("session_id");
    (async () => {
      if (!sid) { navigate("/login"); return; }
      try {
        const { data } = await api.post("/auth/session", { session_id: sid });
        setUser(data);
        window.history.replaceState(null, "", "/dashboard");
        navigate(data.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      } catch {
        navigate("/login");
      }
    })();
  }, [location.hash, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-slate-300">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 rounded-full border-2 border-[#5B21B6] border-t-transparent animate-spin" />
        <p className="mt-4 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
