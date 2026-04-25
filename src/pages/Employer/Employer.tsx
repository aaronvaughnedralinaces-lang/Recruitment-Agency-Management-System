import { useEffect, useState, useCallback, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase, Building2, LogOut, Plus, Trash2, Pencil,
    MapPin, DollarSign, Globe, Phone, Mail,
    CheckCircle2, AlertCircle, Loader2, UploadCloud, X,
    Calendar, Users, Award, FileText, Eye, Clock, Download, ExternalLink
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
    applicant_count?: number;
    country_code?: string;
    state_code?: string;
    city?: string;
}
interface CompanyDocument {
    id: number; doc_type: 'poea_license' | 'business_permit' | 'job_order'; file_url: string; status: 'pending' | 'valid' | 'expired';
}
interface Country { isoCode: string; name: string; }
interface State { code: string; name: string; }
interface City { name: string; }
interface JobApplication {
    id: number;
    job_id: number;
    user_id: number;
    name: string;
    age: number;
    contact_number: string;
    address: string;
    previous_job: string;
    years_experience: number;
    skills: string[];
    highest_education: string;
    worked_abroad: boolean;
    start_date: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
    submitted_at: string;
    updated_at?: string;
    documents?: ApplicationDocument[];
}
interface ApplicationDocument {
    id: number;
    application_id: number;
    document_type: string;
    file_path: string;
    file_url?: string;
    original_filename: string;
    mime_type: string;
    uploaded_at: string;
}

// Preserved your safe API_URL logic
let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
if (API_URL.endsWith('/api')) {
    API_URL = API_URL.replace('/api', '');
}
if (API_URL.endsWith('/')) {
    API_URL = API_URL.slice(0, -1);
}

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
const getDocumentUrl = (doc: ApplicationDocument) => {
    if (doc.file_url) {
        return doc.file_url.startsWith('http') ? doc.file_url : `${API_URL}${doc.file_url}`;
    }
    if (doc.file_path) {
        return `${API_URL}/${doc.file_path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
    }
    return '#';
};
const formatApplicantStatus = (status: JobApplication['status']) => ({
    label: status === 'pending' ? 'Pending review' : status.charAt(0).toUpperCase() + status.slice(1),
    className: status === 'hired'
        ? 'bg-emerald-100 text-emerald-800'
        : status === 'shortlisted'
            ? 'bg-indigo-100 text-indigo-800'
            : status === 'rejected'
                ? 'bg-rose-100 text-rose-800'
                : status === 'reviewed'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-amber-100 text-amber-800'
});
const formatDocumentType = (type: string) => {
    const labelMap: Record<string, string> = {
        passport: 'Passport',
        validId: 'Valid ID',
        resume: 'Resume/CV',
        certEmployment: 'Certificate of Employment',
        trainingCert: 'Training Certificate',
        nbiClearance: 'NBI Clearance',
        medicalCert: 'Medical Certificate',
        oec: 'OEC'
    };
    return labelMap[type] || type.replace(/([A-Z])/g, ' $1').trim();
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

    // Applicants Modal State 
    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [currentApplicants, setCurrentApplicants] = useState<JobApplication[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(null);
    const [currentJob, setCurrentJob] = useState<JobPost | null>(null);

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
    const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicant_count || 0), 0);
    const totalTags = jobs.reduce((sum, job) => sum + (job.tags?.length || 0), 0);

    // ==================== Applicant Management ====================
    const openApplicantsModal = async (job: JobPost) => {
        setCurrentJob(job);
        setIsApplicantsModalOpen(true);
        setLoadingApplicants(true);
        setSelectedApplicant(null);
        try {
            const response = await apiCall(`/api/jobs/${job.id}/applications`);
            const applicants = response?.data || [];
            setCurrentApplicants(applicants);
            setSelectedApplicant(applicants[0] || null);
        } catch (err: any) {
            notify(err.message || "Failed to load applicants", "error");
        } finally {
            setLoadingApplicants(false);
        }
    };

    const closeApplicantsModal = () => {
        setIsApplicantsModalOpen(false);
        setCurrentApplicants([]);
        setSelectedApplicant(null);
        setCurrentJob(null);
    };

    const handleStatusUpdate = async (applicationId: number, newStatus: JobApplication['status']) => {
        try {
            await apiCall(`/api/applications/${applicationId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            setCurrentApplicants(prev =>
                prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
            );
            if (selectedApplicant?.id === applicationId) {
                setSelectedApplicant({ ...selectedApplicant, status: newStatus });
            }
            notify("Applicant status updated!", "success");
        } catch (err: any) {
            notify(err.message || "Failed to update status", "error");
        }
    };

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

    // ========== API Logic (Preserved your robust error handling) ==========
    const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const token = localStorage.getItem("token");
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        let finalUrl = `${baseUrl}${cleanEndpoint}`;
        if (finalUrl.includes('/api/api')) {
            finalUrl = finalUrl.replace('/api/api', '/api');
        }
        
        const res = await fetch(finalUrl, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers
            },
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            
            const contentType = res.headers.get("content-type");
            let errorMessage = `HTTP Error: ${res.status}`;

            if (contentType && contentType.includes("application/json")) {
                const err = await res.json().catch(() => ({}));
                errorMessage = err.message || errorMessage;
            } else {
                await res.text().catch(() => ""); 
            }
            throw new Error(errorMessage);
        }

        if (res.status === 204) return null;
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return res.json();
        }
        return null;
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
        const reader = new FileReader();
        reader.onloadend = () => setProfileForm(prev => ({ ...prev, logo: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        if (!profileForm.name.trim()) return notify("Company name is required.", "error");
        try {
            setLoading(prev => ({ ...prev, saving: true }));
            const token = localStorage.getItem("token");
            if (logoFile) {
                const formData = new FormData();
                formData.append('name', profileForm.name);
                formData.append('description', profileForm.description);
                formData.append('location', profileForm.location);
                formData.append('website', profileForm.website);
                formData.append('contact_email', profileForm.contact_email);
                formData.append('contact_phone', profileForm.contact_phone);
                formData.append('logo', logoFile);
                const response = await fetch(`${API_URL}/api/company`, {
                    method: company ? "PUT" : "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || "Failed to save profile");
                }
            } else {
                await apiCall("/api/company", {
                    method: company ? "PUT" : "POST",
                    body: JSON.stringify(profileForm),
                });
            }
            await fetchData();
            setLogoFile(null);
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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-xl font-semibold text-slate-600">Loading Dashboard...</p>
        </div>
    );

    const isVerified = company?.verified_status === "verified";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
            {/* Modern Navbar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                E
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">Employ</span>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab("jobs")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'jobs'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                            >
                                <Briefcase size={18} />
                                Jobs
                            </button>
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                            >
                                <Building2 size={18} />
                                Company
                            </button>
                        </div>

                        {/* Right actions */}
                        <button
                            onClick={() => { localStorage.clear(); navigate("/auth"); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Toast Notification */}
            {notification && (
                <div className={`fixed top-20 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border backdrop-blur-sm animate-in slide-in-from-top-2 ${notification.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{notification.msg}</p>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Jobs Tab */}
                {activeTab === "jobs" && (
                    <div className="space-y-8">
                        {/* Header */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-indigo-700">
                                        {user?.name ? `Welcome back, ${user.name}` : 'Employer workspace'}
                                    </p>
                                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Hiring Dashboard</h1>
                                    <p className="mt-2 max-w-2xl text-slate-500">
                                        Keep your company profile current, manage active openings, and review applicants with their uploaded documents in one place.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open Roles</p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">{jobs.length}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applicants</p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">{totalApplicants}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tagged Skills</p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">{totalTags}</p>
                                    </div>
                                    <div className={`rounded-xl border px-4 py-3 ${isVerified ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verification</p>
                                        <p className={`mt-2 text-sm font-bold ${isVerified ? 'text-emerald-800' : 'text-amber-800'}`}>
                                            {isVerified ? 'Approved' : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            {isVerified ? (
                                <button
                                    onClick={() => openJobModal()}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                                >
                                    <Plus size={18} />
                                    Post New Job
                                </button>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    <span className="font-medium">Complete company verification to post jobs</span>
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className="ml-2 text-sm font-semibold underline underline-offset-2"
                                    >
                                        Go to Profile
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Job Grid */}
                        {jobs.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                                <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                    <Briefcase className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No jobs posted yet</h3>
                                <p className="text-slate-500 mt-1 max-w-sm mx-auto">Get started by creating your first job listing.</p>
                                {isVerified && (
                                    <button onClick={() => openJobModal()} className="mt-6 text-indigo-600 font-medium hover:text-indigo-700">
                                        + Create a job
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {jobs.map(job => (
                                    <div
                                        key={job.id}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                                    >
                                        <div className="p-6 flex-1">
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                    Active
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {formatDate(job.posted_date)}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2">{job.title}</h3>
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Applicants</p>
                                                    <p className="mt-1 text-lg font-semibold text-slate-900">{job.applicant_count || 0}</p>
                                                </div>
                                                <div className="rounded-xl bg-slate-50 px-3 py-2">
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Skills</p>
                                                    <p className="mt-1 text-lg font-semibold text-slate-900">{job.tags?.length || 0}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <DollarSign size={16} className="text-slate-400" />
                                                    <span>{job.salary_range}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin size={16} className="text-slate-400" />
                                                    <span className="truncate">{job.location}</span>
                                                </div>
                                            </div>
                                            {job.tags && job.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {job.tags.slice(0, 4).map((tag, i) => (
                                                        <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-md">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                                            <button
                                                onClick={() => openApplicantsModal(job)}
                                                className="py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Users size={16} /> Applicants
                                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                                    {job.applicant_count || 0}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => openJobModal(job)}
                                                className="py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Pencil size={16} /> Edit
                                            </button>
                                            <button
                                                onClick={() => deleteJob(job.id)}
                                                className="py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Verification Status */}
                        <div className={`rounded-xl border ${isVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} p-6`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {isVerified ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">{isVerified ? "Verified Company" : "Verification Required"}</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {isVerified
                                            ? "Your company is fully verified. You can post jobs and receive applications."
                                            : "Please upload the required documents below to unlock job posting."}
                                    </p>
                                </div>
                                {!isVerified && (
                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
                                        <Clock size={12} /> Pending
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Company Profile Form */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <Building2 size={20} className="text-indigo-600" />
                                    Company Information
                                </h2>
                            </div>
                            <div className="p-6">
                                {/* Logo Upload */}
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative group">
                                        <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 group-hover:border-indigo-400 transition-colors overflow-hidden">
                                            {profileForm.logo ? (
                                                <img src={getLogoUrl(profileForm.logo)} alt="Logo" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Building2 className="w-8 h-8 text-slate-400" />
                                            )}
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer rounded-xl transition-opacity">
                                                <div className="text-white text-center text-xs font-medium">
                                                    <UploadCloud size={20} className="mx-auto mb-1" />
                                                    Change
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Company Logo</p>
                                        <p className="text-sm text-slate-500">PNG, JPG up to 2MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                                        <input
                                            value={profileForm.name}
                                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Legal company name"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                        <textarea
                                            rows={4}
                                            value={profileForm.description}
                                            onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Tell applicants about your company..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                value={profileForm.location}
                                                onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="url"
                                                value={profileForm.website}
                                                onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="https://"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                value={profileForm.contact_email}
                                                onChange={e => setProfileForm({ ...profileForm, contact_email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="hr@company.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                value={profileForm.contact_phone}
                                                onChange={e => setProfileForm({ ...profileForm, contact_phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading.saving}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading.saving && <Loader2 size={18} className="animate-spin" />}
                                    Save Profile
                                </button>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <FileText size={20} className="text-indigo-600" />
                                    Required Documents
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(['poea_license', 'business_permit', 'job_order'] as const).map((type) => {
                                        const doc = companyDocs.find(d => d.doc_type === type);
                                        const titleMap = { poea_license: 'POEA License', business_permit: 'Business Permit', job_order: 'Job Order' };
                                        const isUploaded = !!doc;
                                        return (
                                            <div key={type} className={`border rounded-xl p-5 ${isUploaded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {isUploaded ? <CheckCircle2 size={20} /> : <UploadCloud size={20} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-slate-900">{titleMap[type]}</h4>
                                                        {doc?.status && (
                                                            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${doc.status === 'valid' ? 'bg-emerald-100 text-emerald-800' :
                                                                doc.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                                                }`}>
                                                                {doc.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    {doc?.file_url && (
                                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline block mb-3">
                                                            View uploaded file
                                                        </a>
                                                    )}
                                                    <label className="cursor-pointer inline-block w-full text-center py-2 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                                        {isUploaded ? 'Replace' : 'Upload'}
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleDocumentUpload(type, file);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Job Modal (redesigned with YOUR location cascade) */}
            {isJobModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">{editingJobId ? "Edit Job" : "Create New Job"}</h2>
                                <p className="text-sm text-slate-500">Fill in the details below.</p>
                            </div>
                            <button onClick={closeJobModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleJobSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                                <input
                                    required
                                    value={jobForm.title}
                                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g. Senior Frontend Developer"
                                />
                            </div>
                            
                            {/* PRESERVED YOUR LOCATION CASCADE */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <select
                                        value={selectedCountry.code}
                                        onChange={handleCountryChange}
                                        className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Country</option>
                                        {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                                    </select>
                                    <select
                                        value={selectedState.code}
                                        onChange={handleStateChange}
                                        disabled={!selectedCountry.code}
                                        className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                                        required
                                    >
                                        <option value="">State</option>
                                        {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                                    </select>
                                    <select
                                        value={selectedCity}
                                        onChange={handleCityChange}
                                        disabled={!selectedState.code}
                                        className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                                        required
                                    >
                                        <option value="">City</option>
                                        {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Range</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        value={jobForm.salary_range}
                                        onChange={e => setJobForm({ ...jobForm, salary_range: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="$70,000 - $110,000 USD"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={jobForm.description}
                                    onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Describe the role, responsibilities, and requirements..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Skills / Tags</label>
                                <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500">
                                    {jobForm.tags.map((tag, i) => (
                                        <span key={i} className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(i)} className="hover:bg-indigo-200 rounded-full p-0.5"><X size={14} /></button>
                                        </span>
                                    ))}
                                    <input
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={handleTagAdd}
                                        onBlur={() => handleTagAdd()}
                                        className="flex-1 min-w-[120px] outline-none text-sm"
                                        placeholder="Add skill (press Enter)"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeJobModal} className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading.saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-70">
                                    {loading.saving && <Loader2 size={16} className="animate-spin" />}
                                    {editingJobId ? "Update Job" : "Publish Job"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Applicants Modal (redesigned) */}
            {isApplicantsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 shrink-0">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-indigo-700">Applicant review</p>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Applicants for <span className="text-indigo-700">{currentJob?.title}</span>
                                    </h2>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                        <span>{currentApplicants.length} candidate{currentApplicants.length !== 1 ? 's' : ''}</span>
                                        {currentJob?.location && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {currentJob.location}</span>}
                                        {currentJob?.posted_date && <span className="inline-flex items-center gap-1"><Calendar size={14} /> Posted {formatDate(currentJob.posted_date)}</span>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeApplicantsModal} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Applicant List */}
                            <div className="md:w-[360px] border-r border-slate-200 flex flex-col bg-slate-50/70">
                                <div className="border-b border-slate-200 p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Applicants</p>
                                            <p className="mt-1 text-xl font-semibold text-slate-900">{currentApplicants.length}</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Documents</p>
                                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                                {currentApplicants.reduce((sum, applicant) => sum + (applicant.documents?.length || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {loadingApplicants ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                                            <Loader2 className="animate-spin w-8 h-8 mb-3" />
                                            <p className="font-medium">Loading applicants...</p>
                                        </div>
                                    ) : currentApplicants.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                                            <Users size={40} className="mb-3 opacity-30" />
                                            <p className="font-medium">No applications yet</p>
                                        </div>
                                    ) : (
                                        currentApplicants.map(applicant => (
                                            <button
                                                key={applicant.id}
                                                onClick={() => setSelectedApplicant(applicant)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all shadow-sm ${selectedApplicant?.id === applicant.id
                                                    ? 'border-indigo-300 bg-indigo-50 shadow-indigo-100'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div>
                                                        <div className="font-medium text-slate-900">{applicant.name}</div>
                                                        <div className="mt-1 text-sm text-slate-500">{applicant.highest_education}</div>
                                                    </div>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${formatApplicantStatus(applicant.status).className}`}>
                                                        {formatApplicantStatus(applicant.status).label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3">
                                                    <span>Exp: {applicant.years_experience} yrs</span>
                                                    <span>Age: {applicant.age}</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(applicant.submitted_at)}</span>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">{applicant.documents?.length || 0} document{(applicant.documents?.length || 0) !== 1 ? 's' : ''}</span>
                                                    <span className="text-slate-500">Start {formatDate(applicant.start_date)}</span>
                                                </div>
                                                {applicant.skills.length > 0 && (
                                                    <div className="flex gap-1 mt-3 flex-wrap">
                                                        {applicant.skills.slice(0, 3).map(skill => (
                                                            <span key={skill} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{skill}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                            {/* Applicant Detail */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {selectedApplicant ? (
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h3 className="text-2xl font-semibold text-slate-900">{selectedApplicant.name}</h3>
                                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${formatApplicantStatus(selectedApplicant.status).className}`}>
                                                            {formatApplicantStatus(selectedApplicant.status).label}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                                                        <p>{selectedApplicant.address}</p>
                                                        <p className="text-indigo-600 font-medium">{selectedApplicant.contact_number}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 lg:min-w-[260px]">
                                                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Applied</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(selectedApplicant.submitted_at)}</p>
                                                    </div>
                                                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Available</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(selectedApplicant.start_date)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 rounded-xl p-4 text-center">
                                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Age</div>
                                                <div className="text-3xl font-semibold text-slate-900 mt-1">{selectedApplicant.age}</div>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-4 text-center">
                                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Experience</div>
                                                <div className="text-3xl font-semibold text-slate-900 mt-1">{selectedApplicant.years_experience} <span className="text-lg font-normal text-slate-500">yrs</span></div>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-4 text-center">
                                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Education</div>
                                                <div className="text-base font-medium text-slate-900 mt-1">{selectedApplicant.highest_education}</div>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-4 text-center">
                                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Worked Abroad</div>
                                                <div className="text-2xl font-semibold text-slate-900 mt-1">{selectedApplicant.worked_abroad ? 'Yes' : 'No'}</div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-5">
                                            <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-3"><Award size={18} className="text-indigo-600" /> Skills</h4>
                                            {selectedApplicant.skills.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedApplicant.skills.map((skill, i) => (
                                                        <span key={i} className="bg-white border border-slate-200 text-slate-700 text-sm px-3 py-1 rounded-full shadow-sm">{skill}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500">No skills were listed on this application.</p>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-5">
                                            <h4 className="font-medium text-slate-900 mb-2">Previous Role</h4>
                                            <p className="text-slate-700">{selectedApplicant.previous_job || 'Not provided'}</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileText size={18} className="text-indigo-600" />
                                                <h4 className="font-medium text-slate-900">Uploaded Documents</h4>
                                            </div>
                                            {selectedApplicant.documents && selectedApplicant.documents.length > 0 ? (
                                                <div className="space-y-3">
                                                    {selectedApplicant.documents.map((document) => (
                                                        <div key={document.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-slate-900">{formatDocumentType(document.document_type)}</p>
                                                                <p className="mt-1 truncate text-sm text-slate-500">{document.original_filename}</p>
                                                                <p className="mt-1 text-xs text-slate-400">Uploaded {formatDate(document.uploaded_at)}</p>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <a
                                                                    href={getDocumentUrl(document)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                                                >
                                                                    <Eye size={16} />
                                                                    View
                                                                </a>
                                                                <a
                                                                    href={getDocumentUrl(document)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    download={document.original_filename}
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <Download size={16} />
                                                                    Download
                                                                </a>
                                                                <a
                                                                    href={getDocumentUrl(document)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                                >
                                                                    <ExternalLink size={16} />
                                                                    Open
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                                                    This applicant has no uploaded documents on record.
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-5">
                                            <span className="text-sm font-medium text-slate-700">Status:</span>
                                            <select
                                                value={selectedApplicant.status}
                                                onChange={(e) => handleStatusUpdate(selectedApplicant.id, e.target.value as JobApplication['status'])}
                                                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="pending">Pending Review</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="shortlisted">Shortlisted</option>
                                                <option value="hired">Hired</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <Eye size={48} className="text-slate-300 mb-4" />
                                        <p className="font-medium text-slate-600">Select an applicant</p>
                                        <p className="text-sm text-slate-400 mt-1">Detailed information will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}