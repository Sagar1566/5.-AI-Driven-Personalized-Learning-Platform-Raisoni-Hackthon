"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Default credentials for quick testing
    const handleUseDemo = () => {
        setUsername("admin");
        setPassword("admin");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (isLogin) {
                // LOGIN
                const formData = new URLSearchParams();
                formData.append("username", username);
                formData.append("password", password);

                const res = await fetch(apiUrl("/api/v1/auth/token"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formData,
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || "Invalid credentials");
                }

                const data = await res.json();
                localStorage.setItem("token", data.access_token);
                // Force refresh to update guards/state
                window.location.href = "/";
            } else {
                // REGISTER
                const res = await fetch(apiUrl("/api/v1/auth/register"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                        email,
                        full_name: fullName,
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || "Registration failed");
                }

                setSuccess("Registration successful! Please sign in.");
                setIsLogin(true); // Switch to login
                setPassword("");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl border border-white/20 animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        DeepTutor
                    </h2>
                    <p className="mt-2 text-white/70">
                        {isLogin ? "Welcome back, please login" : "Create your account"}
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex rounded-lg bg-black/20 p-1">
                    <button
                        onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                        className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${isLogin ? "bg-white text-purple-600 shadow-sm" : "text-white/60 hover:text-white"
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                        className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${!isLogin ? "bg-white text-purple-600 shadow-sm" : "text-white/60 hover:text-white"
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-white/80 uppercase tracking-wider mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-white/50" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-lg bg-white/10 pl-10 pr-4 py-2.5 text-white placeholder-white/30 border border-white/10 focus:border-white focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-white/80 uppercase tracking-wider mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-white/50" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full rounded-lg bg-white/10 pl-10 pr-4 py-2.5 text-white placeholder-white/30 border border-white/10 focus:border-white focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/80 uppercase tracking-wider mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-white/50" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg bg-white/10 pl-10 pr-4 py-2.5 text-white placeholder-white/30 border border-white/10 focus:border-white focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-white/80 uppercase tracking-wider mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-white/50" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg bg-white/10 pl-10 pr-4 py-2.5 text-white placeholder-white/30 border border-white/10 focus:border-white focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="rounded-lg bg-red-500/20 p-3 text-center text-sm font-medium text-red-200 border border-red-500/30 animate-pulse">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="rounded-lg bg-green-500/20 p-3 text-center text-sm font-medium text-green-200 border border-green-500/30">
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full rounded-lg bg-white py-3 text-lg font-bold text-purple-600 transition-all hover:bg-white/90 hover:scale-[1.02] focus:ring-4 focus:ring-purple-900/50 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                {isLogin ? "Signing in..." : "Creating account..."}
                            </>
                        ) : (
                            <>
                                {isLogin ? "Sign In" : "Create Account"}
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {isLogin && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleUseDemo}
                            className="text-xs text-white/40 hover:text-white transition-colors underline decoration-dotted"
                        >
                            Use demo credentials (admin / admin)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
