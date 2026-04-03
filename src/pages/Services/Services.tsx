import React from "react";

export default function ServicesPage() {
    const handleGetStarted = () => {
        alert("📋 Thank you for choosing Honor Deployment! Our placement specialists will reach out within 24 hours.");
    };

    const handleLiveChat = () => {
        alert("💬 Live chat: Our recruitment consultants are online 24/7.");
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
                    <a href="/" className="flex items-center space-x-3 focus:outline-none group">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-800 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                            <span className="text-white font-bold text-lg tracking-wide">HD</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">
                            Honor Deployment
                        </span>
                    </a>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
                        <a href="/" className="hover:text-slate-900 transition-colors duration-200">Home</a>
                        <a href="/Services" className="text-violet-600 transition-colors duration-200">Services</a>
                        <a href="/Values" className="hover:text-slate-900 transition-colors duration-200">Values</a>
                        <a href="/Contact" className="hover:text-slate-900 transition-colors duration-200">Contact</a>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={handleGetStarted}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all transform hover:-translate-y-0.5"
                        >
                            Apply Now
                        </button>
                    </div>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow relative">
                {/* Minimalist Hero Background */}
                <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-violet-100/50 to-slate-50 pointer-events-none"></div>

                <section className="relative pt-20 pb-24 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">

                    {/* Header Text */}
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-violet-100/80 text-violet-700 text-xs font-bold uppercase tracking-widest mb-6 border border-violet-200/50 shadow-sm">
                            Comprehensive Services
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                            We guide you <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">every step</span> of the way.
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            From job matching to post-arrival support, we ensure a smooth, ethical, and fully compliant journey abroad for every Filipino worker.
                        </p>
                    </div>

                    {/* Services Grid (Upgraded to 2x2 for a premium, spacious feel) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">

                        {/* Service 1: Job Placement */}
                        <div className="group bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Job Placement</h3>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Access to thousands of verified jobs in the Middle East, Asia, Europe, and beyond. We meticulously match your unique skills with top-tier global employers.
                            </p>
                            <a href="#" className="inline-flex items-center gap-2 text-green-600 font-semibold group/link">
                                Learn more
                                <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>

                        {/* Service 2: Pre-Departure */}
                        <div className="group bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-400 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 text-violet-600 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Pre-Departure Orientation</h3>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Comprehensive seminars focusing on cultural integration, language basics, labor rights, and financial literacy to prepare you holistically for success.
                            </p>
                            <a href="#" className="inline-flex items-center gap-2 text-violet-600 font-semibold group/link">
                                Learn more
                                <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>

                        {/* Service 3: Legal & Docs */}
                        <div className="group bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Legal & Document Assistance</h3>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                We handle all heavy lifting: POEA processing, visa applications, contract verification, ensuring 100% full compliance with Philippine and international laws.
                            </p>
                            <a href="#" className="inline-flex items-center gap-2 text-orange-500 font-semibold group/link">
                                Learn more
                                <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>

                        {/* Service 4: Post-Arrival */}
                        <div className="group bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Post-Arrival Support</h3>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Your journey doesn't end when you land. Get access to a 24/7 hotline, emergency assistance, and local community networks to help you settle and thrive.
                            </p>
                            <a href="#" className="inline-flex items-center gap-2 text-red-500 font-semibold group/link">
                                Learn more
                                <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>

                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-white text-xs tracking-wider">HD</span>
                                </div>
                                <span className="text-white font-bold text-lg tracking-tight">Honor Deployment</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-6">
                                POEA License No. POEA-123-LB-092405-R. Helping Filipino workers find dignified employment worldwide since 2010.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="/jobs" className="hover:text-violet-400 transition-colors">Job Listings</a></li>
                                <li><a href="/process" className="hover:text-violet-400 transition-colors">Application Process</a></li>
                                <li><a href="/faq" className="hover:text-violet-400 transition-colors">FAQs for OFWs</a></li>
                                <li><a href="/employers" className="hover:text-violet-400 transition-colors">Employer Partners</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-6">Support</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="/guide" className="hover:text-violet-400 transition-colors">OFW Guide</a></li>
                                <li><a href="/rights" className="hover:text-violet-400 transition-colors">Legal Rights</a></li>
                                <li><a href="/hotline" className="hover:text-red-400 transition-colors">Emergency Hotline</a></li>
                                <li><a href="/testimonials" className="hover:text-violet-400 transition-colors">Testimonials</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-6">Follow Us</h4>
                            <div className="flex gap-3">
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all">FB</a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all">IN</a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all">X</a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                        <span>© 2025 Honor Deployment Corporation. All rights reserved.</span>
                        <div className="flex gap-6">
                            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}