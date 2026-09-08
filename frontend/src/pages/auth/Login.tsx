import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../services/auth.service";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login({ username, password }).unwrap();
      dispatch(setCredentials(result));
      navigate("/");
    } catch (err: any) {
      setError(err?.data?.detail || "Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#111318]">
      {/* Left Side - Visual */}
      <div className="relative hidden w-[55%] overflow-hidden lg:block">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1612] via-[#151310] to-[#0e0c0a]" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        {/* Warm glow orbs */}
        <div className="absolute top-[15%] left-[25%] h-[350px] w-[350px] rounded-full bg-[#c08a30]/8 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[15%] h-[300px] w-[300px] rounded-full bg-[#a06b20]/6 blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          {/* Top - Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c08a30] shadow-lg shadow-[#c08a30]/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Malamjaba</span>
              <span className="block text-[11px] font-medium text-[#c08a30]/70 tracking-widest uppercase">Recruiting Agency</span>
            </div>
          </div>

          {/* Center - Tagline */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold leading-[1.15] text-white tracking-tight">
              Manage Your
              <br />
              <span className="text-[#c08a30]">Global Workforce</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#8a8580]">
              End-to-end recruitment management — candidates, agents, visas, medicals, tickets, and finances — all in one place.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {["Candidate Tracking", "Visa Processing", "Agent Management", "Financial Reports"].map((f) => (
                <span key={f} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#a0a0a0]">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom - Stats */}
          <div className="flex gap-12">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="mt-1 text-sm text-[#6a6560]">Active Candidates</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="mt-1 text-sm text-[#6a6560]">Trusted Agents</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">15+</p>
              <p className="mt-1 text-sm text-[#6a6560]">Countries Served</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-[45%]">
        <div className="w-full max-w-[380px]">
          {/* Mobile Logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c08a30]">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-white">Malamjaba</span>
              <span className="block text-[10px] font-medium text-[#c08a30]/70 tracking-wider uppercase">Recruiting Agency</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-[#6a6560]">Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                <div className="h-2 w-2 rounded-full bg-red-500" />
              </div>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2.5 block text-sm font-medium text-[#a0a0a0]">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="h-12 w-full rounded-xl border border-white/10 bg-[#1a1c22] px-4 text-sm text-white placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c08a30]/50 focus:ring-1 focus:ring-[#c08a30]/20"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="mb-2.5 block text-sm font-medium text-[#a0a0a0]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#1a1c22] px-4 pr-12 text-sm text-white placeholder:text-[#4a4540] outline-none transition-all focus:border-[#c08a30]/50 focus:ring-1 focus:ring-[#c08a30]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a5550] transition-colors hover:text-[#a0a0a0]"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-[#c08a30] text-sm font-semibold text-white shadow-lg shadow-[#c08a30]/20 transition-all hover:bg-[#d09535] hover:shadow-xl hover:shadow-[#c08a30]/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-[#4a4540]">
            &copy; 2026 Malamjaba Recruiting Agency
          </p>
        </div>
      </div>
    </div>
  );
}
