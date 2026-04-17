//mport React from "react";

export default function ValuesPage() {
    const handleGetStarted = () => {
        alert("📋 Thank you for choosing Honor Deployment! Our placement specialists will reach out within 24 hours.");
    };

    /*const handleLiveChat = () => {
        alert("💬 Live chat: Our recruitment consultants are online 24/7.");
    };*/

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
                        <a href="/Services" className="hover:text-slate-900 transition-colors duration-200">Services</a>
                        <a href="/Values" className="text-violet-600 transition-colors duration-200">Values</a>
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
                            Our Core DNA
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Guiding Principles</span>
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
                            We are fiercely committed to ethical recruitment, transparent processes, and the uncompromised welfare of every Overseas Filipino Worker we serve.
                        </p>
                    </div>

                    {/* Values Grid (Upgraded to 2x2 for a premium, spacious feel) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">

                        {/* Value 1: Integrity */}
                        <div className="group bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Integrity</h3>
                            <p className="text-slate-500 leading-relaxed">
                                We operate with absolute transparency. This means clear fee structures, honest communication about job realities, and a strict zero-tolerance policy for illegal placements.
                            </p>
                        </div>

                        {/* Value 2: Excellence */}
                        <div className="group bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-400 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-6 text-violet-600 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Excellence</h3>
                            <p className="text-slate-500 leading-relaxed">
                                We partner exclusively with top-tier global employers. Through continuous training and rigorous screening, we maintain one of the highest successful placement rates in the industry.
                            </p>
                        </div>

                        {/* Value 3: Care */}
                        <div className="group bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Care</h3>
                            <p className="text-slate-500 leading-relaxed">
                                You are more than a contract. We provide 24/7 welfare support, comprehensive family assistance programs, and a genuine, lasting commitment to your personal and professional well-being.
                            </p>
                        </div>

                        {/* Value 4: Efficiency */}
                        <div className="group bg-white rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Efficiency</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Time is money for you and your family. Our modernized operations ensure lightning-fast processing, streamlined documentation, and proactive problem-solving at every administrative step.
                            </p>
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