    //import React from "react";

export default function ContactPage() {
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
                        <a href="/Services" className="hover:text-slate-900 transition-colors duration-200">Services</a>
                        <a href="/Values" className="hover:text-slate-900 transition-colors duration-200">Values</a>
                        <a href="/Contact" className="text-violet-600 transition-colors duration-200">Contact</a>
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
                <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-violet-100/50 to-slate-50 pointer-events-none"></div>

                <section className="relative pt-20 pb-24 px-6 sm:px-8 lg:px-10 max-w-6xl mx-auto">

                    {/* Header Text */}
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                            Let's map out your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-orange-500">future.</span>
                        </h1>
                        <p className="text-lg text-slate-500">
                            Whether you're looking for your next global opportunity or searching for world-class talent, our specialists are ready to help.
                        </p>
                    </div>

                    {/* Unified Contact Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-slate-100">

                        {/* Left Side: Contact Info (Dark & Creative) */}
                        <div className="md:w-5/12 bg-slate-900 text-white p-10 md:p-12 relative overflow-hidden flex flex-col justify-between">
                            {/* Abstract decorative shapes */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-violet-600/20 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl"></div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-8">Direct Contact</h3>
                                <ul className="space-y-8">
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-400 mb-1">Headquarters</p>
                                            <p className="font-medium">Unit 808, 8F Pearl Plaza<br />Pasig City, Philippines</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 text-violet-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-400 mb-1">Email Support</p>
                                            <a href="mailto:apply@honordeployment.com" className="font-medium hover:text-violet-300 transition-colors">apply@honordeployment.com</a>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-400 mb-1">Phone</p>
                                            <a href="tel:+63281234567" className="font-medium hover:text-orange-300 transition-colors">+63 (2) 8123 4567</a>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="relative z-10 mt-12 pt-8 border-t border-slate-700/50">
                                <p className="text-sm text-slate-400 mb-4">Need immediate assistance?</p>
                                <button onClick={handleLiveChat} className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors font-medium group">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                                    </div>
                                    Launch Live Chat
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Message Form (Clean & Minimal) */}
                        <div className="md:w-7/12 p-10 md:p-12 lg:p-16 bg-white">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Send a Message</h3>
                            <p className="text-slate-500 mb-8 text-sm">Fill out the form below and our recruitment team will get back to you promptly.</p>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                                        <input type="text" placeholder="Juan Dela Cruz" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <input type="email" placeholder="juan@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                    <input type="tel" placeholder="+63 900 000 0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Message</label>
                                    <textarea rows={4} placeholder="How can we help you today?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all resize-none"></textarea>
                                </div>

                                <button type="submit" className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500">
                                    Send Message
                                </button>
                            </form>
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