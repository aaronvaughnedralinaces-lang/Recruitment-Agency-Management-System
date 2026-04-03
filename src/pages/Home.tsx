import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function HomePage(): React.ReactElement {
    const [scrolled, setScrolled] = useState(false);

    // Effect to handle header background change on scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLaunchDemo = (): void => {
        alert("🎯 Start your journey abroad with us — free consultation and eligibility check.");
    };

    const handleContactSales = (): void => {
        alert("📞 Call us: +63 (2) 1234 5678 | Email: apply@honordeployment.com");
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-violet-100 selection:text-violet-900">
            {/* Header */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-md py-3" : "bg-transparent py-5"
                }`}>
                <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform">
                            <span className="text-white font-bold text-xl">HD</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-800">
                            Honor<span className="text-violet-600">Deployment</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-wide">
                        {["Home", "Services", "Values", "Contact"].map((item) => (
                            <Link
                                key={item}
                                to={item === "Home" ? "/" : `/${item}`}
                                className="text-slate-600 hover:text-violet-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-violet-600 after:transition-all hover:after:w-full"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/auth"
                            className="bg-slate-900 hover:bg-violet-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
                        >
                            Apply Now
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />

                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Licensed Recruitment Agency</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900">
                                Empowering Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600">
                                    Global Future.
                                </span>
                            </h1>

                            <p className="mt-8 text-xl text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                                Bridging world-class Filipino talent with elite global employers.
                                Transparent, ethical, and dedicated to your success beyond borders.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={handleLaunchDemo}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-violet-200 hover:shadow-2xl text-white px-10 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                    Explore Job Openings
                                </button>
                                <Link
                                    to="/services"
                                    className="bg-white border-2 border-slate-200 hover:border-violet-600 text-slate-700 hover:text-violet-600 px-10 py-4 rounded-2xl font-bold transition-all"
                                >
                                    Our Process
                                </Link>
                            </div>

                            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 grayscale opacity-70">
                                {/* Simplified Brand Icons / Logos Placeholder */}
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">POEA Accredited</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">ISO Certified</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zero Fees</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">24/7 Support</div>
                            </div>
                        </div>

                        {/* Interactive "Success Story" Card */}
                        <div className="flex-1 w-full max-w-xl group relative">
                            <div className="absolute inset-0 bg-violet-600 rounded-[2rem] rotate-3 opacity-10 group-hover:rotate-6 transition-transform"></div>
                            <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 transition-transform group-hover:-translate-y-2">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="font-bold text-slate-400 text-sm tracking-widest uppercase">Latest Placements</h3>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map(i => <div key={i} className="w-3 h-3 rounded-full bg-slate-100" />)}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { name: "John S.", role: "Nurse in Tokyo", color: "bg-emerald-100 text-emerald-600", initial: "JS" },
                                        { name: "Maria R.", role: "HR in Dubai", color: "bg-violet-100 text-violet-600", initial: "MR" },
                                        { name: "Carlo L.", role: "IT in Singapore", color: "bg-blue-100 text-blue-600", initial: "CL" }
                                    ].map((user, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div className={`w-12 h-12 ${user.color} rounded-full flex items-center justify-center font-black shadow-sm`}>
                                                {user.initial}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">"Professional & Caring"</p>
                                                <p className="text-xs text-slate-500">{user.name} — {user.role}</p>
                                            </div>
                                            <div className="ml-auto text-violet-600">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-2xl font-black text-slate-800">10k+</span>
                                    <span className="text-sm text-slate-500 font-medium tracking-wide uppercase">Lives Transformed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats strip */}
            <div className="bg-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-3xl font-black text-white">15+</div>
                        <div className="text-violet-400 text-xs font-bold uppercase mt-1">Years Experience</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white">50+</div>
                        <div className="text-violet-400 text-xs font-bold uppercase mt-1">Global Partners</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white">100%</div>
                        <div className="text-violet-400 text-xs font-bold uppercase mt-1">Legal Compliance</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white">24/7</div>
                        <div className="text-violet-400 text-xs font-bold uppercase mt-1">OFW Hotline</div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto rounded-[3rem] bg-gradient-to-br from-violet-600 to-indigo-800 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-violet-200">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                        Start Your Global Chapter Today
                    </h2>
                    <p className="text-violet-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Don't navigate the complex world of overseas employment alone. Let our experts guide you to a safe and rewarding career.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center relative z-10">
                        <Link
                            to="/auth"
                            className="bg-white text-violet-700 hover:bg-violet-50 px-10 py-4 rounded-2xl font-bold shadow-xl transition-all transform hover:scale-105"
                        >
                            Submit Application
                        </Link>
                        <button
                            onClick={handleContactSales}
                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-10 py-4 rounded-2xl font-bold transition-all"
                        >
                            Speak with a Consultant
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer & Back to Top remain similar but with updated slate-900 styling... */}
            <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-slate-800">
                {/* ... (Footer content with text-slate-400 and hover:text-white) ... */}
                <div className="max-w-7xl mx-auto px-6 text-center border-t border-slate-800 mt-16 pt-8 text-sm">
                    © 2026 Honor Deployment Corporation. All rights reserved.
                </div>
            </footer>
        </div>
    );
}