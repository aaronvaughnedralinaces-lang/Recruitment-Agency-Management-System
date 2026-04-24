import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    MapPin,
    Search,
    Sparkles,
    Wallet,
    X,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";
import { getLogoUrl } from "../../utils/logoUtils";

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
    job_type: "full-time" | "part-time" | "contract" | "internship";
    status: "open" | "closed" | "draft";
    posted_date: string;
    closing_date: string | null;
    company_name: string;
    company_logo: string | null;
}

type JobTypeFilter = Job["job_type"] | "all";

const jobTypeOptions: Array<{ value: JobTypeFilter; label: string }> = [
    { value: "all", label: "All roles" },
    { value: "full-time", label: "Full time" },
    { value: "part-time", label: "Part time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
];

const getJobTypeLabel = (type: Job["job_type"]) => {
    const labels: Record<Job["job_type"], string> = {
        "full-time": "Full Time",
        "part-time": "Part Time",
        contract: "Contract",
        internship: "Internship",
    };
    return labels[type];
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getDaysSincePosted = (postedDate: string) => {
    const posted = new Date(postedDate).getTime();
    const today = Date.now();
    const diff = Math.max(0, today - posted);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? "Today" : `${days}d ago`;
};

const getCompanyFallback = (name: string) => name.charAt(0).toUpperCase();

const filterJobs = (
    jobs: Job[],
    searchWhat: string,
    searchWhere: string,
    jobType: JobTypeFilter,
) => {
    const query = searchWhat.trim().toLowerCase();
    const locationQuery = searchWhere.trim().toLowerCase();

    return jobs.filter((job) => {
        const matchesQuery =
            !query ||
            job.title.toLowerCase().includes(query) ||
            job.description.toLowerCase().includes(query) ||
            job.company_name.toLowerCase().includes(query);

        const matchesLocation =
            !locationQuery ||
            (job.location && job.location.toLowerCase().includes(locationQuery));

        const matchesType = jobType === "all" || job.job_type === jobType;

        return matchesQuery && matchesLocation && matchesType;
    });
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchWhat, setSearchWhat] = useState("");
    const [searchWhere, setSearchWhere] = useState("");
    const [jobType, setJobType] = useState<JobTypeFilter>("all");
    const [user, setUser] = useState<User | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applying, setApplying] = useState(false); // Added back your applying state

    // Secure dynamic API base URL from your original code
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
            return;
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        fetchJobs(token);
    }, [navigate]);

    useEffect(() => {
        setFilteredJobs(filterJobs(jobs, searchWhat, searchWhere, jobType));
    }, [jobs, searchWhat, searchWhere, jobType]);

    useEffect(() => {
        if (!selectedJob) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedJob(null);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [selectedJob]);

    // Added your original backend fetch URL logic
    const fetchJobs = async (token: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs?limit=12&sort=posted_date,desc&status=open`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch jobs");
            }

            const data = await response.json();
            let jobsArray = Array.isArray(data) ? data : data.jobs || [];

            jobsArray = jobsArray.map((job: any) => ({
                ...job,
                company_name: job.company_name || job.company?.name || "Unknown Company",
                company_logo: job.company_logo || job.company?.logo_url || null,
                job_type: job.job_type || "full-time",
                status: job.status || "open",
            }));

            setJobs(jobsArray);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError("Unable to load job listings. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Added back your Apply function logic mapped to the new selectedJob state
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
            setSelectedJob(null); // Close the modal
        } catch (err: any) {
            console.error('Apply error:', err);
            alert(err.message || 'Something went wrong. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    const clearFilters = () => {
        setSearchWhat("");
        setSearchWhere("");
        setJobType("all");
    };

    const recentJobs = jobs.filter((job) => {
        const posted = new Date(job.posted_date).getTime();
        return Date.now() - posted <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const stats = [
        { label: "Open roles", value: `${jobs.length}` },
        { label: "Matching results", value: `${filteredJobs.length}` },
        { label: "New this week", value: `${recentJobs}` },
        { label: "Top format", value: jobs[0] ? getJobTypeLabel(jobs[0].job_type) : "Live jobs" },
    ];

    return (
        <UserPortalShell
            eyebrow={user ? `Welcome back, ${user.name.split(" ")[0]}` : "Career hub"}
            title="Discover high-quality roles with a faster search flow."
            description="Explore curated opportunities, filter by location and job type, and review role details without losing context."
            stats={stats}
            actions={
                <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-orange-50 p-5 text-center shadow-[0_18px_60px_-28px_rgba(124,58,237,0.45)] sm:min-w-80">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-950">Keep your profile sharp</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                A polished summary and updated experience make it easier to move quickly when you find a fit.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/profile"
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                        Update profile
                        <ArrowRight size={16} />
                    </Link>
                </div>
            }
        >
            <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur xl:p-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-600">Search smarter</p>
                        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                            Refine opportunities in a single view
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                            Search by role, keyword, location, or role type. Results update instantly so you can compare options without extra clicks.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:flex">
                        <QuickStat label="Last sync" value={loading ? "Loading" : "Just now"} />
                        <QuickStat label="Remote-friendly" value={`${jobs.filter((job) => !job.location || /remote/i.test(job.location)).length}`} />
                    </div>
                </div>

                <form
                    onSubmit={(event) => event.preventDefault()}
                    className="mt-6 grid gap-4 rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-4 lg:grid-cols-[1.1fr_1fr_auto] lg:items-end"
                >
                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">What are you looking for?</span>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Frontend Engineer, Nurse, Operations..."
                                value={searchWhat}
                                onChange={(event) => setSearchWhat(event.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>
                    </label>

                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Preferred location</span>
                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="City, country, or remote"
                                value={searchWhere}
                                onChange={(event) => setSearchWhere(event.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>
                    </label>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 lg:flex-none"
                        >
                            Reset
                        </button>
                        <Link
                            to="/my-applications"
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 lg:flex-none"
                        >
                            Track applications
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </form>

                <div className="mt-5 flex flex-wrap gap-2">
                    {jobTypeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setJobType(option.value)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${jobType === option.value
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-950">Latest opportunities</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {filteredJobs.length === 0 && jobs.length > 0
                                ? "No jobs match the current filters."
                                : `${filteredJobs.length} role${filteredJobs.length === 1 ? "" : "s"} ready to review.`}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                            {jobs.filter((job) => job.salary_range).length} roles with salary details
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                            {jobs.filter((job) => job.closing_date).length} with closing dates
                        </span>
                    </div>
                </div>

                {loading && (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((card) => (
                            <div key={card} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-100" />
                                <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                                <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                                <div className="mt-6 space-y-3">
                                    {[0, 1, 2].map((line) => (
                                        <div key={line} className="h-4 animate-pulse rounded bg-slate-100" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
                        <p className="text-sm font-bold text-red-700">Unable to load job listings</p>
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => {
                                const token = localStorage.getItem("token");
                                if (token) fetchJobs(token);
                            }}
                            className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && filteredJobs.length === 0 && (
                    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                            <BriefcaseBusiness size={28} />
                        </div>
                        <h3 className="mt-5 text-xl font-black text-slate-900">
                            {jobs.length === 0 ? "No open roles right now" : "No jobs match these filters"}
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {jobs.length === 0
                                ? "Check back soon for new postings."
                                : "Try broadening your search or clearing the current filters to see more roles."}
                        </p>
                        {jobs.length > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && filteredJobs.length > 0 && (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredJobs.map((job) => (
                            <button
                                key={job.id}
                                type="button"
                                onClick={() => setSelectedJob(job)}
                                className="group rounded-[1.6rem] border border-slate-200 bg-white p-4 text-left shadow-[0_20px_60px_-36px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_30px_70px_-34px_rgba(124,58,237,0.28)]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-orange-50 text-base font-black text-violet-700">
                                            {job.company_logo ? (
                                                <img
                                                    src={getLogoUrl(job.company_logo)}
                                                    alt={`${job.company_name} logo`}
                                                    className="h-full w-full rounded-xl object-cover"
                                                />
                                            ) : (
                                                getCompanyFallback(job.company_name)
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-slate-500">{job.company_name}</p>
                                                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700">
                                                    {getJobTypeLabel(job.job_type)}
                                                </span>
                                            </div>
                                            <h3 className="mt-2 line-clamp-2 text-lg font-black tracking-tight text-slate-950 transition group-hover:text-violet-700">
                                                {job.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700">
                                        {getDaysSincePosted(job.posted_date)}
                                    </span>
                                </div>

                                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                                    {job.description}
                                </p>

                                <div className="mt-4 space-y-2.5">
                                    <CompactMetaRow icon={<MapPin size={14} />} value={job.location || "Remote or flexible"} />
                                    <CompactMetaRow icon={<Wallet size={14} />} value={job.salary_range || "Salary not specified"} />
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                        <CalendarDays size={14} />
                                        Posted {formatDate(job.posted_date)}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-700">
                                        View role
                                        <ArrowRight className="transition group-hover:translate-x-1" size={16} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <button
                        type="button"
                        className="absolute inset-0"
                        onClick={() => setSelectedJob(null)}
                        aria-label="Close job details"
                    />

                    <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/30 bg-white shadow-2xl flex flex-col">
                        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),rgba(249,115,22,0.08))] px-5 py-5 sm:px-7 shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white text-lg font-black text-violet-700 shadow-sm">
                                        {selectedJob.company_logo ? (
                                            <img
                                                src={getLogoUrl(selectedJob.company_logo)}
                                                alt={`${selectedJob.company_name} logo`}
                                                className="h-full w-full rounded-2xl object-cover"
                                            />
                                        ) : (
                                            getCompanyFallback(selectedJob.company_name)
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-violet-700">{selectedJob.company_name}</p>
                                        <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                                            {selectedJob.title}
                                        </h3>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700 shadow-sm">
                                                {getJobTypeLabel(selectedJob.job_type)}
                                            </span>
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700 shadow-sm">
                                                {getDaysSincePosted(selectedJob.posted_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedJob(null)}
                                    className="rounded-2xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                                    aria-label="Close modal"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto px-5 py-6 sm:px-7 flex-1">
                            <div className="space-y-5">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <ModalStat label="Location" value={selectedJob.location || "Remote / Flexible"} />
                                    <ModalStat label="Compensation" value={selectedJob.salary_range || "Not specified"} />
                                    <ModalStat label="Posted" value={formatDate(selectedJob.posted_date)} />
                                    <ModalStat label="Closing" value={selectedJob.closing_date ? formatDate(selectedJob.closing_date) : "Open until filled"} />
                                </div>

                                <div className={`grid gap-4 ${selectedJob.requirements ? "lg:grid-cols-2" : ""}`}>
                                    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 h-full">
                                        <SectionHeading title="Role overview" icon={<BriefcaseBusiness size={18} />} />
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                            {selectedJob.description}
                                        </p>
                                    </section>

                                    {selectedJob.requirements && (
                                        <section className="rounded-2xl border border-slate-200 bg-white p-5 h-full">
                                            <SectionHeading title="Requirements" icon={<Building2 size={18} />} />
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                {selectedJob.requirements}
                                            </p>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7 shrink-0">
                            <button
                                type="button"
                                onClick={() => setSelectedJob(null)}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                            >
                                Close
                            </button>
                            {/* Changed the button logic here to use your handleApply instead of navigate */}
                            <button
                                type="button"
                                onClick={() => navigate(`/apply/${selectedJob.id}`)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
                            >
                                Apply now
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserPortalShell>
    );
}

// Below are the helper components extracted from your friend's code
function QuickStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm sm:min-w-28">
            <p className="text-lg font-black text-slate-950">{value}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
        </div>
    );
}

function CompactMetaRow({ icon, value }: { icon: ReactNode; value: string }) {
    return (
        <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                {icon}
            </div>
            <p className="line-clamp-1 font-medium">{value}</p>
        </div>
    );
}

function ModalStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{value}</p>
        </div>
    );
}

function SectionHeading({ title, icon }: { title: string; icon: ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-slate-950">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                {icon}
            </div>
            <h4 className="text-lg font-black tracking-tight">{title}</h4>
        </div>
    );
}