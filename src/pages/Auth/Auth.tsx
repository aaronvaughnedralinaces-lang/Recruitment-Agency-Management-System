import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<"applicant" | "employer">("applicant");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const handleTabChange = (tab: "login" | "register") => {
        setActiveTab(tab);
        setError("");
        setSuccessMessage("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (activeTab === "login") {
            try {
                const res = await api.post("/auth/login", { email, password });
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                const userRole = res.data.user.role;
                if (userRole === "employer") {
                    navigate("/Employer");
                } else if (userRole === "admin") {
                    navigate("/AdminPage");
                } else {
                    navigate("/Dashboard");
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Login failed. Please check your credentials.");
            }
        } else {
            if (password !== confirmPassword) {
                setError("Passwords do not match. Please try again.");
                return;
            }
            try {
                await api.post("/auth/register", { name, email, password, role });
                setSuccessMessage("Your profile has been created! Please sign in to continue.");
                setActiveTab("login");
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setRole("applicant");
            } catch (err: any) {
                setError(err.response?.data?.message || "Registration failed. Please try again.");
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            {/* Soft, Global Agency Background Accents */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                <div className="absolute top-1/4 right-0 w-80 h-80 bg-orange-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                {/* Subtle dot pattern to represent a global network/map */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }}></div>
            </div>

            <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
                {/* Agency Branding */}
                <div className="text-center mb-8">
                    <a href="/" className="inline-flex flex-col items-center group">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform group-hover:-translate-y-1 transition-all duration-300">
                            {/* Globe / Network Icon */}
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Honor Deployment
                        </h2>
                        <p className="text-sm font-medium text-orange-600 mt-1">Global Talent Solutions</p>
                    </a>
                </div>

                {/* Main Card */}
                <div className="bg-white py-8 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:rounded-2xl sm:px-10 border border-slate-100 relative">
                    {/* Top Brand Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-orange-400 rounded-t-2xl"></div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                        <button
                            type="button"
                            onClick={() => handleTabChange("login")}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "login"
                                    ? "bg-white text-violet-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange("register")}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === "register"
                                    ? "bg-white text-violet-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Apply / Register
                        </button>
                    </div>

                    {/* Alerts (Strictly Red and Green for clarity) */}
                    {error && (
                        <div className="mb-6 flex items-start p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
                            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-6 flex items-start p-4 text-sm text-green-700 bg-green-50 rounded-xl border border-green-100">
                            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            {successMessage}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {activeTab === "register" && (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Legal Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors sm:text-sm"
                                        placeholder="Juan Dela Cruz"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        What brings you to Honor Deployment?
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Applicant Role */}
                                        <label className="cursor-pointer">
                                            <input
                                                type="radio"
                                                value="applicant"
                                                checked={role === "applicant"}
                                                onChange={() => setRole("applicant")}
                                                className="hidden peer"
                                            />
                                            <div className="flex flex-col items-center text-center p-4 border border-slate-200 rounded-xl transition-all peer-checked:border-violet-600 peer-checked:bg-violet-50 hover:bg-slate-50">
                                                <svg className={`w-6 h-6 mb-2 ${role === 'applicant' ? 'text-violet-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className={`text-sm font-semibold ${role === 'applicant' ? 'text-violet-700' : 'text-slate-600'}`}>Find Overseas Jobs</span>
                                            </div>
                                        </label>

                                        {/* Employer Role */}
                                        <label className="cursor-pointer">
                                            <input
                                                type="radio"
                                                value="employer"
                                                checked={role === "employer"}
                                                onChange={() => setRole("employer")}
                                                className="hidden peer"
                                            />
                                            <div className="flex flex-col items-center text-center p-4 border border-slate-200 rounded-xl transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-slate-50">
                                                <svg className={`w-6 h-6 mb-2 ${role === 'employer' ? 'text-orange-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className={`text-sm font-semibold ${role === 'employer' ? 'text-orange-700' : 'text-slate-600'}`}>Hire Global Talent</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                {activeTab === "login" && (
                                    <a href="#" className="text-sm font-medium text-violet-600 hover:text-violet-500">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {activeTab === "register" && (
                            <div className="animate-in fade-in duration-300">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3.5 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all transform active:scale-[0.98]"
                        >
                            {activeTab === "login" ? "Sign In to Dashboard" : "Create My Profile"}
                        </button>
                    </form>

                    {/* Third Party Auth */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-xl bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-xl bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                        </div>
                    </div>
                </div>

                {/* Agency Footer Note */}
                <p className="mt-8 text-center text-xs text-slate-500">
                    By proceeding, you agree to Honor Deployment's <a href="#" className="font-semibold text-violet-600 hover:text-violet-500">Terms of Service</a> and <a href="#" className="font-semibold text-violet-600 hover:text-violet-500">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}