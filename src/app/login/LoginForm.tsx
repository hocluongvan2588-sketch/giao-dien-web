"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "ok"; text: string } | null>(
    params.get("error") ? { type: "error", text: "Liên kết xác thực không hợp lệ hoặc đã hết hạn." } : null,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message === "Invalid login credentials" ? "Email hoặc mật khẩu không đúng." : error.message });
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      setLoading(false);
      if (error) return setMessage({ type: "error", text: error.message });
      if (data.session) {
        router.replace(next);
        router.refresh();
      } else {
        setMessage({ type: "ok", text: "Đã gửi email xác nhận. Vui lòng mở email và bấm vào liên kết để kích hoạt tài khoản." });
      }
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h1>
        <p className="mt-1 text-sm text-brand-900/60">
          {mode === "login" ? "Đăng nhập để mua và tải giao diện đã mua." : "Tài khoản giúp bạn lưu và tải lại giao diện đã mua."}
        </p>
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="password">Mật khẩu</label>
        <input id="password" type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {message && (
        <p className={`rounded-xl px-3 py-2 text-sm ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-800"}`}>{message.text}</p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Đăng ký"}
      </button>
      <p className="text-center text-sm text-brand-900/70">
        {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
        <button type="button" className="font-semibold text-brand-700 hover:underline" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(null); }}>
          {mode === "login" ? "Đăng ký" : "Đăng nhập"}
        </button>
      </p>
    </form>
  );
}
