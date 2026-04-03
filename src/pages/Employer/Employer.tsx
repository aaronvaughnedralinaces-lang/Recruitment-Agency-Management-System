import React, { useEffect, useState, useCallback, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase, Building2, LogOut, Plus, Trash2, Pencil,
    MapPin, DollarSign, Globe, Phone, Mail,
    CheckCircle2, AlertCircle, Loader2, UploadCloud, X,
    Calendar, ChevronRight
} from "lucide-react";

// ==================== Type Definitions ====================
interface User { id: number; name: string; email: string; role: string; }
interface Company {
    id: number; name: string; description: string; logo: string;
    location: string; website: string; contact_email: string;
    contact_phone: string; verified_status: "verified" | "unverified";
}
interface JobPost {
    id: number; title: string; description: string; salary_range: string;
    location: string; company_id: number; posted_date: string; tags?: string[];
    country_code?: string;
    state_code?: string;
    city?: string;
}
interface CompanyDocument {
    id: number; doc_type: 'poea_license' | 'business_permit' | 'job_order'; file_url: string; status: 'pending' | 'valid' | 'expired';
}

interface Country {
    isoCode: string;
    name: string;
}
interface State {
    code: string;
    name: string;
}
interface City {
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ==================== Helper Functions ====================
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};


const getLogoUrl = (logoPath: string) => {
    if (!logoPath) return '';
    if (logoPath.startsWith('data:') || logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        return logoPath;
    }
    return `${API_URL}/${logoPath.replace(/^\/+/, '')}`;
};
// ==================== Main Component ====================
export default function EmployerDashboard() {
    const navigate = useNavigate();

    // Core State
    const [activeTab, setActiveTab] = useState<"jobs" | "profile">("jobs");
    const [user, setUser] = useState<User | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [companyDocs, setCompanyDocs] = useState<CompanyDocument[]>([]);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // UI & Loading State
    const [loading, setLoading] = useState({ init: true, jobs: false, saving: false, uploading: false });
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // Job Modal State
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJobId, setEditingJobId] = useState<number | null>(null);
    const [jobForm, setJobForm] = useState({
        title: "", description: "", salary_range: "", location: "", tags: [] as string[],
        country_code: "", state_code: "", city: ""
    });
    const [tagInput, setTagInput] = useState("");

    // Location cascade state
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCountry, setSelectedCountry] = useState({ code: '', name: '' });
    const [selectedState, setSelectedState] = useState({ code: '', name: '' });
    const [selectedCity, setSelectedCity] = useState('');

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: "", description: "", logo: "", location: "", website: "", contact_email: "", contact_phone: ""
    });

    // ==================== Location API Calls ====================
    const fetchCountries = async (): Promise<Country[]> => {
        const res = await fetch(`${API_URL}/api/location/countries`);
        return res.json();
    };

    const fetchStates = async (countryCode: string): Promise<State[]> => {
        const res = await fetch(`${API_URL}/api/location/states/${countryCode}`);
        return res.json();
    };

    const fetchCities = async (countryCode: string, stateCode: string): Promise<City[]> => {
        const res = await fetch(`${API_URL}/api/location/cities/${countryCode}/${stateCode}`);
        return res.json();
    };

    // ========== API Logic ==========
    const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers
            },
        });
        if (!res.ok) {
            if (res.status === 404) return null;
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Request failed");
        }
        return res.status === 204 ? null : res.json();
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, jobs: true }));
            const [companyData, jobsData, docsData] = await Promise.all([
                apiCall("/api/company").catch(() => null),
                apiCall("/api/jobs").catch(() => []),
                apiCall("/api/company/documents").catch(() => [])
            ]);

            if (companyData) {
                setCompany(companyData);
                setProfileForm({
                    name: companyData.name || "", description: companyData.description || "",
                    logo: companyData.logo || "", location: companyData.location || "",
                    website: companyData.website || "", contact_email: companyData.contact_email || "",
                    contact_phone: companyData.contact_phone || ""
                });
                if (companyData.verified_status !== "verified") setActiveTab("profile");
            } else {
                setActiveTab("profile");
            }
            setJobs(jobsData || []);
            setCompanyDocs(docsData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, init: false, jobs: false }));
        }
    }, [apiCall]);

    const loadCountries = async () => {
        const allCountries = await fetchCountries();
        setCountries(allCountries);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth");
            return;
        }
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchData();
        loadCountries();
    }, [navigate, fetchData]);

    const notify = (msg: string, type: 'success' | 'error') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // ========== Job Management ==========
    const resetCascade = () => {
        setSelectedCountry({ code: '', name: '' });
        setSelectedState({ code: '', name: '' });
        setSelectedCity('');
        setStates([]);
        setCities([]);
    };

    const openJobModal = async (job?: JobPost) => {
        if (job) {
            setEditingJobId(job.id);
            setJobForm({
                title: job.title, description: job.description,
                salary_range: job.salary_range, location: job.location, tags: job.tags || [],
                country_code: job.country_code || "",
                state_code: job.state_code || "",
                city: job.city || ""
            });

            if (job.country_code) {
                setSelectedCountry({ code: job.country_code, name: '' });
                const statesData = await fetchStates(job.country_code);
                setStates(statesData);
                if (job.state_code) {
                    const foundState = statesData.find(s => s.code === job.state_code);
                    setSelectedState({ code: job.state_code, name: foundState?.name || '' });
                    const citiesData = await fetchCities(job.country_code, job.state_code);
                    setCities(citiesData);
                    if (job.city) setSelectedCity(job.city);
                }
            } else {
                resetCascade();
            }
        } else {
            setEditingJobId(null);
            setJobForm({
                title: "", description: "", salary_range: "", location: "", tags: [],
                country_code: "", state_code: "", city: ""
            });
            resetCascade();
        }
        setTagInput("");
        setIsJobModalOpen(true);
    };

    const closeJobModal = () => setIsJobModalOpen(false);

    const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        const country = countries.find(c => c.isoCode === countryCode);
        setSelectedCountry({ code: countryCode, name: country?.name || '' });
        setSelectedState({ code: '', name: '' });
        setSelectedCity('');
        setStates([]);
        setCities([]);
        setJobForm(prev => ({ ...prev, country_code: countryCode, state_code: "", city: "", location: "" }));

        if (countryCode) {
            const statesData = await fetchStates(countryCode);
            setStates(statesData);
        }
    };

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateCode = e.target.value;
        const state = states.find(s => s.code === stateCode);
        setSelectedState({ code: stateCode, name: state?.name || '' });
        setSelectedCity('');
        setCities([]);
        setJobForm(prev => ({ ...prev, state_code: stateCode, city: "", location: "" }));

        if (stateCode && selectedCountry.code) {
            const citiesData = await fetchCities(selectedCountry.code, stateCode);
            setCities(citiesData);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityName = e.target.value;
        setSelectedCity(cityName);
        const locationParts = [cityName, selectedState.name, selectedCountry.name].filter(Boolean);
        const fullLocation = locationParts.join(', ');
        setJobForm(prev => ({ ...prev, city: cityName, location: fullLocation }));
    };

    const handleTagAdd = (e?: KeyboardEvent) => {
        if (e && e.key !== 'Enter' && e.key !== ',') return;
        if (e) e.preventDefault();
        const cleanTag = tagInput.trim().replace(/,/g, '');
        if (cleanTag && !jobForm.tags.includes(cleanTag)) {
            setJobForm(prev => ({ ...prev, tags: [...prev.tags, cleanTag] }));
        }
        setTagInput("");
    };

    const removeTag = (index: number) => {
        setJobForm(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
    };

    const handleJobSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobForm.location.trim()) {
            notify("Please select a valid location (Country, State, City).", "error");
            return;
        }
        try {
            setLoading(prev => ({ ...prev, saving: true }));
            const method = editingJobId ? "PUT" : "POST";
            const endpoint = editingJobId ? `/api/jobs/${editingJobId}` : "/api/jobs";

            const payload = {
                title: jobForm.title,
                description: jobForm.description,
                salary_range: jobForm.salary_range,
                location: jobForm.location,
                tags: jobForm.tags,
                country_code: jobForm.country_code,
                state_code: jobForm.state_code,
                city: jobForm.city
            };

            const savedJob = await apiCall(endpoint, {
                method, body: JSON.stringify(payload)
            });

            if (editingJobId) {
                setJobs(prev => prev.map(j => j.id === editingJobId ? savedJob : j));
                notify("Job updated successfully", "success");
            } else {
                setJobs(prev => [savedJob, ...prev]);
                notify("Job published live", "success");
            }
            closeJobModal();
        } catch (err: any) {
            notify(err.message, "error");
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    };

    const deleteJob = async (id: number) => {
        if (!confirm("Are you sure? This will permanently remove the listing.")) return;
        try {
            await apiCall(`/api/jobs/${id}`, { method: "DELETE" });
            setJobs(prev => prev.filter(j => j.id !== id));
            notify("Listing deleted", "success");
        } catch (err: any) { notify(err.message, "error"); }
    };

    // ========== Profile Management ==========
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return notify("Please upload an image file.", "error");
        if (file.size > 2 * 1024 * 1024) return notify("File must be smaller than 2MB.", "error");
        setLogoFile(file);
        // Show a preview (optional)
        const reader = new FileReader();
        reader.onloadend = () => setProfileForm(prev => ({ ...prev, logo: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        if (!profileForm.name.trim()) return notify("Company name is required.", "error");
        try {
            setLoading(prev => ({ ...prev, saving: true }));

            let response;
            if (logoFile) {
                const formData = new FormData();
                formData.append('name', profileForm.name);
                formData.append('description', profileForm.description);
                formData.append('location', profileForm.location);
                formData.append('website', profileForm.website);
                formData.append('contact_email', profileForm.contact_email);
                formData.append('contact_phone', profileForm.contact_phone);
                formData.append('logo', logoFile);

                const token = localStorage.getItem("token");
                response = await fetch(`${API_URL}/api/company`, {
                    method: company ? "PUT" : "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
            } else {
                response = await apiCall("/api/company", {
                    method: company ? "PUT" : "POST",
                    body: JSON.stringify(profileForm),
                });
            }

            if (!response.ok) throw new Error('Failed to save');

            await fetchData();
            setLogoFile(null); // clear the pending file
            notify("Company profile saved!", "success");
        } catch (err: any) {
            notify(err.message, "error");
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    };

    const handleDocumentUpload = async (docType: string, file: File) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('doc_type', docType);
        try {
            setLoading(prev => ({ ...prev, uploading: true }));
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/company/documents`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Upload failed');
            notify("Document uploaded successfully for review.", "success");
            const docsData = await apiCall("/api/company/documents").catch(() => []);
            setCompanyDocs(docsData || []);
        } catch (err: any) { notify(err.message, "error"); }
        finally { setLoading(prev => ({ ...prev, uploading: false })); }
    };

    // ========== UI Rendering ==========
    if (loading.init) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Setting up your workspace...</p>
        </div>
    );

    const isVerified = company?.verified_status === "verified";

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">HD</div>
                        <div className="hidden sm:block">
                            <span className="font-bold text-slate-900 block leading-tight">Employer Hub</span>
                            <span className="text-xs text-slate-500 font-medium block">{user?.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setActiveTab("jobs")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'jobs' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Briefcase size={16} /> <span className="hidden sm:inline">Listings</span>
                        </button>
                        <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Building2 size={16} /> <span className="hidden sm:inline">Company</span>
                        </button>
                    </div>
                    <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 rounded-xl">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            {/* Toasts */}
            {notification && (
                <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{notification.msg}</p>
                </div>
            )}

            <main className="max-w-5xl mx-auto px-4 pt-8">
                {/* ========== JOBS TAB ========== */}
                {activeTab === "jobs" && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Job Listings</h1>
                                <p className="text-slate-500 mt-2 font-medium">Manage your open positions and attract top talent.</p>
                            </div>
                            {isVerified ? (
                                <button onClick={() => openJobModal()} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95">
                                    <Plus size={20} /> Post a Job
                                </button>
                            ) : (
                                <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-200 text-sm font-bold flex items-center gap-2">
                                    <AlertCircle size={18} /> Verification Pending
                                </div>
                            )}
                        </div>

                        {!isVerified && (
                            <div className="mb-8 bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4">
                                <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shrink-0"><Building2 size={24} /></div>
                                <div>
                                    <h4 className="text-lg text-amber-900 font-bold mb-1">Action Required: Complete Profile</h4>
                                    <p className="text-amber-700 mb-4 font-medium">You must complete your company profile and upload verification documents before you can post jobs.</p>
                                    <button onClick={() => setActiveTab("profile")} className="bg-amber-200 text-amber-900 px-5 py-2 rounded-xl font-bold hover:bg-amber-300 transition-colors">Go to Settings →</button>
                                </div>
                            </div>
                        )}

                        {jobs.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300"><Briefcase size={40} /></div>
                                <h3 className="text-xl font-bold text-slate-900">Your job board is empty</h3>
                                <p className="text-slate-500 mt-2 mb-8">Once you post a job, it will appear here for management.</p>
                                {isVerified && <button onClick={() => openJobModal()} className="text-indigo-600 font-bold hover:underline">Start hiring now <ChevronRight className="inline" size={16} /></button>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {jobs.map(job => (
                                    <div key={job.id} className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all relative flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                                                <Calendar size={10} /> {formatDate(job.posted_date)}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openJobModal(job)} className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors"><Pencil size={16} /></button>
                                                <button onClick={() => deleteJob(job.id)} className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3">{job.title}</h3>
                                        <div className="flex flex-wrap gap-4 mb-4">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium"><MapPin size={16} className="text-slate-400" /> {job.location}</div>
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium"><DollarSign size={16} className="text-emerald-500" /> {job.salary_range}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-5">
                                            {job.tags?.map((t, i) => (
                                                <span key={i} className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">#{t}</span>
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mt-auto border-t border-slate-100 pt-4">{job.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ========== PROFILE TAB ========== */}
                {activeTab === "profile" && (
                    <section className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">Company Settings</h2>
                                <p className="text-slate-500 font-medium mt-1">Manage your public identity and verify your account.</p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                {isVerified ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                {isVerified ? "Verified Employer" : "Pending Verification"}
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Logo Upload */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                    {profileForm.logo ? (
                                        <img src={getLogoUrl(profileForm.logo)} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Building2 className="w-10 h-10 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className="font-bold text-slate-900">Brand Logo</h4>
                                    <p className="text-sm text-slate-500 mb-4">Upload a high-res square image (Max 2MB).</p>
                                    <div className="flex justify-center sm:justify-start gap-3">
                                        <label className="cursor-pointer inline-flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
                                            <UploadCloud size={16} /> Upload Image
                                            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                        </label>
                                        {profileForm.logo && (
                                            <button onClick={() => setProfileForm(prev => ({ ...prev, logo: "" }))} className="text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Documents Grid */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Verification Documents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(['poea_license', 'business_permit', 'job_order'] as const).map((type) => {
                                        const doc = companyDocs.find(d => d.doc_type === type);
                                        const statusColors = {
                                            valid: 'bg-emerald-100 text-emerald-700',
                                            expired: 'bg-rose-100 text-rose-700',
                                            pending: 'bg-amber-100 text-amber-700'
                                        };
                                        const badgeColor = doc ? statusColors[doc.status] : 'bg-slate-100 text-slate-500';
                                        const badgeText = doc ? (doc.status.charAt(0).toUpperCase() + doc.status.slice(1)) : 'Required';
                                        const titleMap = { poea_license: 'POEA License', business_permit: 'Business Permit', job_order: 'Job Order Contract' };

                                        return (
                                            <div key={type} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-slate-800">{titleMap[type]}</h4>
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
                                                        {badgeText}
                                                    </span>
                                                </div>
                                                {doc?.file_url && (
                                                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm font-semibold hover:underline mb-4 inline-block">View Current File</a>
                                                )}
                                                <div className="mt-auto">
                                                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-indigo-50 border-2 border-dashed border-slate-200 hover:border-indigo-300 text-slate-600 px-3 py-3 rounded-xl text-sm font-bold transition-all">
                                                        <UploadCloud size={16} /> {doc ? 'Replace File' : 'Upload PDF/JPG'}
                                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleDocumentUpload(type, file);
                                                            e.target.value = '';
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Basic Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Company Name *</label>
                                    <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="Enter full legal name" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Company Overview</label>
                                    <textarea rows={4} value={profileForm.description} onChange={e => setProfileForm({ ...profileForm, description: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none" placeholder="What does your company do?" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">HQ Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <input value={profileForm.location} onChange={e => setProfileForm({ ...profileForm, location: e.target.value })} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="City, Country" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <input type="url" value={profileForm.website} onChange={e => setProfileForm({ ...profileForm, website: e.target.value })} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="https://" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Public Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <input type="email" value={profileForm.contact_email} onChange={e => setProfileForm({ ...profileForm, contact_email: e.target.value })} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="contact@company.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <input type="tel" value={profileForm.contact_phone} onChange={e => setProfileForm({ ...profileForm, contact_phone: e.target.value })} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button onClick={handleSaveProfile} disabled={loading.saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                    {loading.saving ? <Loader2 className="animate-spin" /> : "Save Profile Details"}
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* ========== UNIFIED JOB MODAL with Location Cascade ========== */}
            {isJobModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                        <div className="p-8 md:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-slate-900">{editingJobId ? "Update Listing" : "New Opportunity"}</h2>
                                <button onClick={closeJobModal} className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleJobSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                                    <input required value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Senior Product Designer" />
                                </div>

                                {/* LOCATION CASCADE */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                                        <select
                                            value={selectedCountry.code}
                                            onChange={handleCountryChange}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-500 outline-none"
                                            required
                                        >
                                            <option value="">Select Country</option>
                                            {countries.map(country => (
                                                <option key={country.isoCode} value={country.isoCode}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">State / Province</label>
                                        <select
                                            value={selectedState.code}
                                            onChange={handleStateChange}
                                            disabled={!selectedCountry.code}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-500 outline-none disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {states.map(state => (
                                                <option key={state.code} value={state.code}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                        <select
                                            value={selectedCity}
                                            onChange={handleCityChange}
                                            disabled={!selectedState.code}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 focus:bg-white focus:border-indigo-500 outline-none disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select City</option>
                                            {cities.map(city => (
                                                <option key={city.name} value={city.name}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Salary Range</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <input required value={jobForm.salary_range} onChange={e => setJobForm({ ...jobForm, salary_range: e.target.value })} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="$5k - $8k / month" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Job Description</label>
                                    <textarea required rows={5} value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none" placeholder="What are the key responsibilities?" />
                                </div>

                                {/* Tags Input */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Keywords / Tags</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl min-h-[64px] items-center focus-within:bg-white focus-within:border-indigo-500 transition-all cursor-text" onClick={() => document.getElementById("tag-input")?.focus()}>
                                        {jobForm.tags.map((tag, i) => (
                                            <span key={i} className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold pl-3 pr-1.5 py-1.5 rounded-xl">
                                                {tag}
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(i); }} className="hover:bg-indigo-800 rounded-lg p-0.5 transition-colors"><X size={14} /></button>
                                            </span>
                                        ))}
                                        <input
                                            id="tag-input"
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={handleTagAdd}
                                            onBlur={() => handleTagAdd()}
                                            className="flex-1 bg-transparent border-none outline-none text-sm px-2 min-w-[140px] font-medium text-slate-700 placeholder:font-normal"
                                            placeholder={jobForm.tags.length === 0 ? "Type and press Enter..." : ""}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 ml-1 font-medium">Type a skill and hit <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">Enter</kbd> or comma.</p>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button type="button" onClick={closeJobModal} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                                    <button disabled={loading.saving} className="flex-[2] bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {loading.saving ? <Loader2 className="animate-spin" /> : editingJobId ? "Save Changes" : "Publish Listing"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}