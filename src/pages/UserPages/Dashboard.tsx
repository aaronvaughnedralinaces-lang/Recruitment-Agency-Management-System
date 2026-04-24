import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getLogoUrl } from '../../utils/logoUtils';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Job {
    id: number;
    title: string;
    description: string;
    requirements: string | null;
    location: string | null;
    salary_range: string | null;
    job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
    status: 'open' | 'closed' | 'draft';
    posted_date: string;
    closing_date: string | null;
    company_name: string;
    company_logo: string | null;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchWhat, setSearchWhat] = useState("");
    const [searchWhere, setSearchWhere] = useState("");
    const [user, setUser] = useState<User | null>(null);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [applying, setApplying] = useState(false);
    // Secure dynamic API base URL
    let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (API_BASE_URL.endsWith('/api')) {
        API_BASE_URL = API_BASE_URL.replace('/api', '');
    }
    if (API_BASE_URL.endsWith('/')) {
        API_BASE_URL = API_BASE_URL.slice(0, -1);
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth");
        } else {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            fetchJobs(token);
        }
    }, [navigate]);

    // Filter jobs whenever jobs, searchWhat, or searchWhere changes
    useEffect(() => {
        if (!jobs.length) {
            setFilteredJobs([]);
            return;
        }

        let filtered = [...jobs];

        // Filter by job title (case-insensitive partial match)
        if (searchWhat.trim()) {
            const query = searchWhat.trim().toLowerCase();
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(query) ||
                (job.description && job.description.toLowerCase().includes(query))
            );
        }

        // Filter by location (case-insensitive partial match)
        if (searchWhere.trim()) {
            const locationQuery = searchWhere.trim().toLowerCase();
            filtered = filtered.filter(job =>
                job.location && job.location.toLowerCase().includes(locationQuery)
            );
        }

        setFilteredJobs(filtered);
    }, [jobs, searchWhat, searchWhere]);

    const fetchJobs = async (token: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs?limit=12&sort=posted_date,desc&status=open`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            let jobsArray = Array.isArray(data) ? data : data.jobs || [];

            jobsArray = jobsArray.map((job: any) => ({
                ...job,
                company_name: job.company_name || job.company?.name || 'Unknown Company',
                company_logo: job.company_logo || job.company?.logo_url || null,
                job_type: job.job_type || 'full-time',
                status: job.status || 'open'
            }));

            setJobs(jobsArray);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Unable to load job listings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Filtering is already handled by the useEffect, but we can add a small UX feedback
        if (!searchWhat.trim() && !searchWhere.trim()) {
            // Optionally show a toast or just do nothing
        }
    };

    const clearFilters = () => {
        setSearchWhat("");
        setSearchWhere("");
    };

    const openJobModal = (job: Job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedJob(null);
    };

    const handleApply = async () => {
        if (!selectedJob || !user) return;

        setApplying(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_BASE_URL}/api/applications/apply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_id: selectedJob.id,
                    user_id: user.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit application');
            }

            alert(`Successfully applied for ${selectedJob.title} at ${selectedJob.company_name}!`);
            closeModal();
        } catch (err: any) {
            console.error('Apply error:', err);
            alert(err.message || 'Something went wrong. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getJobTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'full-time': 'Full Time',
            'part-time': 'Part Time',
            'contract': 'Contract',
            'internship': 'Internship'
        };
        return labels[type] || type;
    };

    // Helper to show result count
    const getResultCountText = () => {
        if (filteredJobs.length === 0 && jobs.length > 0) return "No jobs match your search.";
        if (searchWhat || searchWhere) return `Found ${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''}`;
        return null;
    };

    return (
        <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Ambient background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>

            {/* Header (unchanged) */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
                    <Link to="/dashboard" className="flex items-center space-x-3 focus:outline-none group">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-800 rounded-xl flex items-center justify-center shadow-lg transform group-hover:-translate-y-0.5 group-hover:shadow-violet-600/30 transition-all duration-300">
                            <span className="text-white font-bold text-lg tracking-wide">HD</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm group-hover:text-violet-600 transition-colors duration-300">
                            Honor Deployment
                        </span>
                    </Link>

                    <div className="hidden md:flex flex-wrap items-center gap-8 text-sm font-semibold text-slate-600">
                        {[{ name: "Home Dashboard", path: "/dashboard" }, { name: "Applied Jobs", path: "/applied-jobs" }, { name: "Companies Hub", path: "/companies" }].map((link, idx) => (
                            <Link
                                key={idx}
                                to={link.path}
                                className={`transition-all duration-300 relative group pb-1.5 ${idx === 0 ? "text-violet-600 font-bold" : "hover:text-violet-600"}`}
                            >
                                {link.name}
                                {idx === 0 && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-full scale-x-100 transition-transform origin-left duration-300"></div>
                                )}
                                {idx !== 0 && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        {user && (
                            <Link
                                to="/profile"
                                className="flex items-center justify-center w-11 h-11 rounded-xl bg-violet-50 border-2 border-transparent hover:border-violet-100 group transition-all duration-300 active:scale-95"
                                title="My Profile"
                            >
                                <svg className="w-5 h-5 text-violet-600 hover:text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all transform active:scale-95 cursor-pointer relative z-10"
                        >
                            Log Out
                        </button>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 relative z-10">
                {/* Search Section */}
                <div className="bg-white/70 backdrop-blur-lg rounded-[2rem] shadow-[0_15px_60px_-15px_rgba(139,92,246,0.1)] p-8 mb-12 border border-violet-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl"></div>

                    <div className="relative z-10 mb-8 max-w-2xl">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 mb-3 leading-tight">
                            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-orange-500">Future Global Job.</span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Discover global jobs across all industries that match your skills. It's your moment to shine.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-6 lg:items-end relative z-10 bg-white/80 p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex-1 space-y-2 group">
                            <label htmlFor="what" className="flex items-center gap-2 text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">
                                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Search Query (Job Title / Description)
                            </label>
                            <input
                                type="text"
                                id="what"
                                placeholder="Software Engineer, Healthcare, Marketing..."
                                value={searchWhat}
                                onChange={(e) => setSearchWhat(e.target.value)}
                                className="w-full px-5 py-4 bg-orange-50 border-2 border-transparent rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 text-sm font-medium"
                            />
                        </div>
                        <div className="flex-1 space-y-2 group">
                            <label htmlFor="where" className="flex items-center gap-2 text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">
                                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Where do you want to work?
                            </label>
                            <input
                                type="text"
                                id="where"
                                placeholder="Preferred Country or City"
                                value={searchWhere}
                                onChange={(e) => setSearchWhere(e.target.value)}
                                className="w-full px-5 py-4 bg-orange-50 border-2 border-transparent rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 text-sm font-medium"
                            />
                        </div>
                        <div className="flex items-end gap-3 flex-shrink-0">
                            <button
                                type="submit"
                                className="w-full lg:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold transition-all transform active:scale-95 group flex items-center gap-2 justify-center shadow-md active:shadow-inner focus:ring-4 focus:ring-orange-500/30"
                            >
                                <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                Find Opportunities
                            </button>
                            {(searchWhat || searchWhere) && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-5 py-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Job Listings Area */}
                <div>
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                            Newest Opportunities
                        </h2>
                        <div className="flex gap-4">
                            {getResultCountText() && (
                                <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
                                    {getResultCountText()}
                                </span>
                            )}
                            <Link to="/applied-jobs" className="text-sm font-semibold text-violet-600 hover:text-violet-500 transition-colors flex items-center gap-1 group">
                                My Job Status Dashboard
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => {
                                    const token = localStorage.getItem("token");
                                    if (token) fetchJobs(token);
                                }}
                                className="mt-3 text-violet-600 hover:text-violet-700 font-semibold"
                            >
                                Try Again →
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredJobs.length === 0 && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-100">
                            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <p className="text-slate-500 text-lg">
                                {jobs.length === 0 ? "No job openings at the moment." : "No jobs match your search."}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                                {jobs.length === 0 ? "Check back soon for new opportunities!" : "Try different keywords or clear the filters."}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => openJobModal(job)}
                                className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 h-full w-1.5 bg-violet-500 rounded-r-3xl scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>

                                {/* Header with Logo and Title */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center overflow-hidden border border-slate-100">
                                        {job.company_logo ? (
                                            <img
                                                src={getLogoUrl(job.company_logo)}
                                                alt={`${job.company_name} logo`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56?text=🏢';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-2xl">🏢</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold tracking-tight text-slate-950 mb-1 group-hover:text-violet-700 transition-colors line-clamp-1">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium truncate">
                                            {job.company_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Job Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="truncate">{job.location || 'Remote / Flexible'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>{job.salary_range || 'Salary not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span>Posted {formatDate(job.posted_date)}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100">
                                    <span className="inline-block text-xs font-semibold bg-violet-50 text-violet-700 px-3 py-1 rounded-full">
                                        {getJobTypeLabel(job.job_type)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Job Details Modal (unchanged) */}
            {isModalOpen && selectedJob && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-orange-50 flex items-center justify-center">
                                    {selectedJob.company_logo ? (
                                        <img
                                            src={getLogoUrl(selectedJob.company_logo)}
                                            alt={selectedJob.company_name}
                                            className="w-8 h-8 object-cover rounded"
                                        />
                                    ) : (
                                        <span className="text-xl">🏢</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedJob.title}</h3>
                                    <p className="text-sm text-slate-500">{selectedJob.company_name}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 py-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Location</p>
                                    <p className="font-semibold text-slate-800">{selectedJob.location || 'Remote / Flexible'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Salary Range</p>
                                    <p className="font-semibold text-slate-800">{selectedJob.salary_range || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Job Type</p>
                                    <p className="font-semibold text-slate-800">{getJobTypeLabel(selectedJob.job_type)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Posted Date</p>
                                    <p className="font-semibold text-slate-800">{formatDate(selectedJob.posted_date)}</p>
                                </div>
                                {selectedJob.closing_date && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Closing Date</p>
                                        <p className="font-semibold text-orange-600">{formatDate(selectedJob.closing_date)}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                                    Job Description
                                </h4>
                                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {selectedJob.description}
                                </div>
                            </div>

                            {selectedJob.requirements && (
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        Requirements
                                    </h4>
                                    <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                        {selectedJob.requirements}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {applying ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Apply Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}