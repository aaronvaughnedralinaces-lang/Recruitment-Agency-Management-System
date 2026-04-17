import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
    Pencil, Trash2, Plus, Briefcase, GraduationCap,
    /*User,*/ LogOut, X, Save, Mail, Calendar, MapPin, CheckCircle2
} from "lucide-react";

// Types
interface CareerEntry {
    id: number;
    job_title: string;
    company_name: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
}

interface EducationEntry {
    id: number;
    qualification: string;
    institution: string;
    completion_date: string;
    highlights: string | null;
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    bio: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
};

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
};

// Helper to get initials for avatar
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [career, setCareer] = useState<CareerEntry[]>([]);
    const [education, setEducation] = useState<EducationEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBio, setEditingBio] = useState(false);
    const [bioDraft, setBioDraft] = useState("");

    // Modal states
    const [showCareerModal, setShowCareerModal] = useState(false);
    const [editingCareer, setEditingCareer] = useState<CareerEntry | null>(null);
    const [careerForm, setCareerForm] = useState({
        job_title: "", company_name: "", start_date: "", end_date: "", description: ""
    });

    const [showEducationModal, setShowEducationModal] = useState(false);
    const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);
    const [educationForm, setEducationForm] = useState({
        qualification: "", institution: "", completion_date: "", highlights: ""
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth");
            return;
        }
        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/profile`, getAuthHeaders());
            setUser(res.data.user);
            setCareer(res.data.career);
            setEducation(res.data.education);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateBio = async () => {
        try {
            await axios.put(`${API_URL}/api/profile/bio`, { bio: bioDraft }, getAuthHeaders());
            if (user) setUser({ ...user, bio: bioDraft });
            setEditingBio(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update bio");
        }
    };

    // Career Handlers
    const openCareerModal = (entry?: CareerEntry) => {
        if (entry) {
            setEditingCareer(entry);
            setCareerForm({
                job_title: entry.job_title,
                company_name: entry.company_name,
                start_date: entry.start_date ? entry.start_date.split('T')[0].slice(0, 7) : "",
                end_date: entry.end_date ? entry.end_date.split('T')[0].slice(0, 7) : "",
                description: entry.description || ""
            });
        } else {
            setEditingCareer(null);
            setCareerForm({ job_title: "", company_name: "", start_date: "", end_date: "", description: "" });
        }
        setShowCareerModal(true);
    };

    const saveCareer = async () => {
        const startFull = careerForm.start_date ? `${careerForm.start_date}-01` : null;
        const endFull = careerForm.end_date ? `${careerForm.end_date}-01` : null;
        const data = { ...careerForm, start_date: startFull, end_date: endFull };
        try {
            if (editingCareer) {
                await axios.put(`${API_URL}/api/career/${editingCareer.id}`, data, getAuthHeaders());
            } else {
                await axios.post(`${API_URL}/api/career`, data, getAuthHeaders());
            }
            fetchProfile();
            setShowCareerModal(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save career entry");
        }
    };

    const deleteCareer = async (id: number) => {
        if (!window.confirm("Delete this career entry?")) return;
        try {
            await axios.delete(`${API_URL}/api/career/${id}`, getAuthHeaders());
            fetchProfile();
        } catch (err) {
            console.error(err);
            alert("Failed to delete");
        }
    };

    // Education Handlers
    const openEducationModal = (entry?: EducationEntry) => {
        if (entry) {
            setEditingEducation(entry);
            setEducationForm({
                qualification: entry.qualification,
                institution: entry.institution,
                completion_date: entry.completion_date ? entry.completion_date.split('T')[0].slice(0, 7) : "",
                highlights: entry.highlights || ""
            });
        } else {
            setEditingEducation(null);
            setEducationForm({ qualification: "", institution: "", completion_date: "", highlights: "" });
        }
        setShowEducationModal(true);
    };

    const saveEducation = async () => {
        const completionFull = educationForm.completion_date ? `${educationForm.completion_date}-01` : null;
        const data = { ...educationForm, completion_date: completionFull };
        try {
            if (editingEducation) {
                await axios.put(`${API_URL}/api/education/${editingEducation.id}`, data, getAuthHeaders());
            } else {
                await axios.post(`${API_URL}/api/education`, data, getAuthHeaders());
            }
            fetchProfile();
            setShowEducationModal(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save education entry");
        }
    };

    const deleteEducation = async (id: number) => {
        if (!window.confirm("Delete this education entry?")) return;
        try {
            await axios.delete(`${API_URL}/api/education/${id}`, getAuthHeaders());
            fetchProfile();
        } catch (err) {
            console.error(err);
            alert("Failed to delete");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-violet-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (!user) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <nav className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
                    <Link to="/dashboard" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-violet-200 transition-all">
                            <span className="text-white font-bold text-xl">HD</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-violet-700 transition-colors">Honor Deployment</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <Link to="/dashboard" className="hover:text-violet-600 transition">Dashboard</Link>
                        <Link to="/applied-jobs" className="hover:text-violet-600 transition">Applied Jobs</Link>
                        <Link to="/companies" className="hover:text-violet-600 transition">Companies</Link>
                        <Link to="/profile" className="text-violet-700 font-semibold relative after:absolute after:-bottom-5 after:left-0 after:w-full after:h-0.5 after:bg-violet-600">Profile</Link>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 lg:px-8 mt-10 space-y-8">

                {/* Profile Hero Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>

                    <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-violet-200 shrink-0 ring-4 ring-white">
                            {getInitials(user.name || "User")}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user.name}</h1>
                                <div className="flex items-center gap-2 text-slate-500 mt-1">
                                    <Mail size={16} className="text-violet-500" />
                                    <span>{user.email}</span>
                                </div>
                            </div>

                            {/* Bio Editor inline */}
                            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 relative">
                                {!editingBio ? (
                                    <div className="group/bio">
                                        <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider flex justify-between items-center">
                                            Professional Summary
                                            <button onClick={() => { setBioDraft(user.bio || ""); setEditingBio(true); }} className="text-violet-600 hover:text-violet-800 flex items-center gap-1 text-xs opacity-0 group-hover/bio:opacity-100 transition-opacity bg-violet-50 px-2 py-1 rounded-md">
                                                <Pencil size={12} /> Edit
                                            </button>
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                                            {user.bio || "No summary added yet. Write a brief overview of your professional background."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea
                                            rows={4}
                                            value={bioDraft}
                                            onChange={(e) => setBioDraft(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow resize-none"
                                            placeholder="Write your professional summary here..."
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setEditingBio(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors">
                                                Cancel
                                            </button>
                                            <button onClick={updateBio} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition-all">
                                                <Save size={16} /> Save Profile
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Career Timeline */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-violet-50 rounded-xl text-violet-600">
                                <Briefcase size={22} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Experience</h2>
                        </div>
                        <button onClick={() => openCareerModal()} className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                            <Plus size={16} /> Add Role
                        </button>
                    </div>

                    {career.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-medium">No experience added</p>
                            <p className="text-sm text-slate-400 mt-1">Add your past and current roles to stand out.</p>
                        </div>
                    ) : (
                        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 space-y-10">
                            {career.map((entry) => (
                                <div key={entry.id} className="relative group">
                                    <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-5 h-5 bg-white border-4 border-violet-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative">

                                        {/* Actions */}
                                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur pl-2">
                                            <button onClick={() => openCareerModal(entry)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => deleteCareer(entry.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900">{entry.job_title}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                                <MapPin size={14} className="text-violet-500" />
                                                {entry.company_name}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatDate(entry.start_date)} – {entry.end_date ? formatDate(entry.end_date) : <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-xs">Present</span>}
                                            </div>
                                        </div>
                                        {entry.description && (
                                            <p className="text-slate-600 text-sm leading-relaxed mt-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 whitespace-pre-wrap">
                                                {entry.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Education Timeline */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                <GraduationCap size={22} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Education</h2>
                        </div>
                        <button onClick={() => openEducationModal()} className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                            <Plus size={16} /> Add Education
                        </button>
                    </div>

                    {education.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-medium">No education added</p>
                            <p className="text-sm text-slate-400 mt-1">List your degrees, certifications, or bootcamp completions.</p>
                        </div>
                    ) : (
                        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 space-y-10">
                            {education.map((entry) => (
                                <div key={entry.id} className="relative group">
                                    <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative">

                                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur pl-2">
                                            <button onClick={() => openEducationModal(entry)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => deleteEducation(entry.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900">{entry.qualification}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                                <MapPin size={14} className="text-indigo-500" />
                                                {entry.institution}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                                                <CheckCircle2 size={14} className="text-slate-500" />
                                                Class of {formatDate(entry.completion_date)}
                                            </div>
                                        </div>
                                        {entry.highlights && (
                                            <p className="text-slate-600 text-sm leading-relaxed mt-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 whitespace-pre-wrap">
                                                {entry.highlights}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Shared Modal Overlay Styles */}
            {/* Career Modal */}
            {showCareerModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl scale-100 transition-transform duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">{editingCareer ? "Edit Role" : "Add Experience"}</h3>
                            <button onClick={() => setShowCareerModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); saveCareer(); }} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Job Title</label>
                                <input type="text" required value={careerForm.job_title} onChange={(e) => setCareerForm({ ...careerForm, job_title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all" placeholder="e.g. Senior Frontend Engineer" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Company</label>
                                <input type="text" required value={careerForm.company_name} onChange={(e) => setCareerForm({ ...careerForm, company_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all" placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Start Date</label>
                                    <input type="month" required value={careerForm.start_date} onChange={(e) => setCareerForm({ ...careerForm, start_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">End Date</label>
                                    <input type="month" value={careerForm.end_date} onChange={(e) => setCareerForm({ ...careerForm, end_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all" />
                                    <p className="text-xs text-slate-500 font-medium ml-1">Leave empty if present</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Description</label>
                                <textarea rows={4} value={careerForm.description} onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all resize-none" placeholder="What did you build? What were your achievements?" />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowCareerModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-violet-200 transition-all">
                                    Save Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Education Modal */}
            {showEducationModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl scale-100 transition-transform duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">{editingEducation ? "Edit Education" : "Add Education"}</h3>
                            <button onClick={() => setShowEducationModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); saveEducation(); }} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Degree / Certificate</label>
                                <input type="text" required value={educationForm.qualification} onChange={(e) => setEducationForm({ ...educationForm, qualification: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. B.S. Computer Science" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Institution</label>
                                <input type="text" required value={educationForm.institution} onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Stanford University" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Graduation Date</label>
                                <input type="month" required value={educationForm.completion_date} onChange={(e) => setEducationForm({ ...educationForm, completion_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Highlights (Optional)</label>
                                <textarea rows={4} value={educationForm.highlights} onChange={(e) => setEducationForm({ ...educationForm, highlights: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none" placeholder="GPA, honors, thesis, clubs..." />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowEducationModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all">
                                    Save Education
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}