import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ==================== Type Definitions ====================
interface User {
    id: number;
    email: string;
    role: "admin" | "employer" | "jobseeker" | "deployment_officer";
    first_name: string;
    last_name: string;
    phone?: string;
    company_id?: number;
    status: "active" | "inactive" | "suspended";
    created_at?: string;
}

interface Company {
    id: number;
    name: string;
    description: string;
    logo: string;
    location: string;
    website: string;
    contact_email: string;
    contact_phone: string;
    verified_status: "verified" | "unverified";
    created_at?: string;
}

interface JobPost {
    id: number;
    title: string;
    description: string;
    requirements?: string;
    salary_range: string;
    location: string;
    job_type: "full-time" | "part-time" | "contract" | "internship";
    status: "open" | "closed" | "draft";
    company_id: number;
    company_name?: string;
    posted_date: string;
    closing_date?: string;
}

interface ActivityLog {
    id: number;
    user_id: number | null;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    details: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

// ==================== Main Component ====================
let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
if (API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = API_BASE_URL.replace('/api', '');
}
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<"companies" | "users" | "jobs" | "activity">("companies");

    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);

    const [errorCompanies, setErrorCompanies] = useState("");
    const [errorUsers, setErrorUsers] = useState("");
    const [errorJobs, setErrorJobs] = useState("");
    const [errorLogs, setErrorLogs] = useState("");

    const [showDocsModal, setShowDocsModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companyDocs, setCompanyDocs] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [updatingDocId, setUpdatingDocId] = useState<number | null>(null);

    const [togglingCompanyId, setTogglingCompanyId] = useState<number | null>(null);

    const getAuthHeader = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    // ========== API Calls ==========
    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        setErrorCompanies("");
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/companies`, {
                headers: getAuthHeader(),
            });
            if (!response.ok) throw new Error("Failed to fetch companies");
            const data = await response.json();
            setCompanies(data);
        } catch (err: any) {
            setErrorCompanies(err.message);
        } finally {
            setLoadingCompanies(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        setErrorUsers("");
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                headers: getAuthHeader(),
            });
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data);
        } catch (err: any) {
            setErrorUsers(err.message);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchJobs = async () => {
        setLoadingJobs(true);
        setErrorJobs("");
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs`, {
                headers: getAuthHeader(),
            });
            if (!response.ok) throw new Error("Failed to fetch jobs");
            const data = await response.json();
            setJobs(data);
        } catch (err: any) {
            setErrorJobs(err.message);
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchActivityLogs = async () => {
        setLoadingLogs(true);
        setErrorLogs("");
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/activity-logs`, {
                headers: getAuthHeader(),
            });
            if (!response.ok) throw new Error("Failed to fetch activity logs");
            const data = await response.json();
            setActivityLogs(data);
        } catch (err: any) {
            setErrorLogs(err.message);
            console.warn("Using mock activity logs");
            setActivityLogs([
                {
                    id: 1,
                    user_id: 1,
                    action: "System Deployment",
                    entity_type: "system",
                    entity_id: null,
                    details: "Version 2.1.0 deployed successfully",
                    ip_address: null,
                    user_agent: null,
                    created_at: new Date().toISOString(),
                },
                {
                    id: 2,
                    user_id: 2,
                    action: "Database Migration",
                    entity_type: "database",
                    entity_id: null,
                    details: "Migrated user profiles to new schema",
                    ip_address: "127.0.0.1",
                    user_agent: "Mozilla/5.0",
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                },
                {
                    id: 3,
                    user_id: null,
                    action: "API Gateway Update",
                    entity_type: "infrastructure",
                    entity_id: null,
                    details: "Rate limiting configuration failed, rolled back",
                    ip_address: null,
                    user_agent: null,
                    created_at: new Date(Date.now() - 172800000).toISOString(),
                },
            ]);
        } finally {
            setLoadingLogs(false);
        }
    };
    const fetchCompanyDocuments = async (companyId: number) => {
        setLoadingDocs(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/companies/${companyId}/documents`, {
                headers: getAuthHeader(),
            });
            if (!response.ok) throw new Error('Failed to fetch documents');
            const data = await response.json();
            setCompanyDocs(data);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoadingDocs(false);
        }
    };

    const updateDocumentStatus = async (docId: number, newStatus: string) => {
        if (!window.confirm(`Set document status to ${newStatus}?`)) return;
        setUpdatingDocId(docId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/documents/${docId}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }
            if (selectedCompany) {
                await fetchCompanyDocuments(selectedCompany.id);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setUpdatingDocId(null);
        }
    };

    const toggleVerification = async (companyId: number, currentStatus: "verified" | "unverified") => {
        const newStatus = currentStatus === "verified" ? "unverified" : "verified";
        const confirmMsg = `Are you sure you want to mark this company as ${newStatus}?`;
        if (!window.confirm(confirmMsg)) return;

        setTogglingCompanyId(companyId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/companies/${companyId}`, {
                method: "PUT",
                headers: getAuthHeader(),
                body: JSON.stringify({ verified_status: newStatus }),
            });
            if (!response.ok) throw new Error("Failed to update verification status");
            await fetchCompanies();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setTogglingCompanyId(null);
        }
    };

    const refreshAllData = () => {
        fetchCompanies();
        fetchUsers();
        fetchJobs();
        fetchActivityLogs();
    };

    // ========== Authentication & Role Check ==========
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const currentUser: User = {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                first_name: payload.first_name || "",
                last_name: payload.last_name || "",
                status: payload.status || "active",
            };
            setUser(currentUser);
            setIsAdmin(currentUser.role === "admin");
        } catch (e) {
            console.error("Failed to decode token");
            localStorage.removeItem("token");
            navigate("/auth");
        }
    }, [navigate]);

    useEffect(() => {
        if (user && isAdmin) {
            refreshAllData();
        } else if (user && !isAdmin) {
            navigate("/employer/dashboard");
        }
    }, [user, isAdmin]);

    // ========== Helper Functions ==========
    const getFullName = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return "Unknown";
        return `${firstName || ""} ${lastName || ""}`.trim();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("employer");
        navigate("/auth");
    };

    const totalCompanies = companies.length;
    const totalUsers = users.length;
    const totalJobs = jobs.length;

    // ========== Render Functions ==========
    const renderCompaniesTab = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Companies</h2>
                        <p className="text-sm text-gray-500">All registered companies on the platform</p>
                    </div>
                    <div className="text-sm bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                        Total: {totalCompanies}
                    </div>
                </div>
            </div>
            {loadingCompanies ? (
                <div className="p-8 text-center text-gray-500">Loading companies...</div>
            ) : errorCompanies ? (
                <div className="p-8 text-center text-red-500">Error: {errorCompanies}</div>
            ) : companies.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No companies found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">ID</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Company Name</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Location</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Contact Email</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Website</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Verified Status</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Created</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {companies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 text-gray-500">{company.id}</td>
                                    <td className="px-6 py-3 font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            {company.logo ? (
                                                <img src={company.logo} alt={company.name} className="w-6 h-6 rounded object-cover" />
                                            ) : (
                                                <div className="w-6 h-6 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                                                    {company.name.charAt(0)}
                                                </div>
                                            )}
                                            {company.name}
                                        </div>
                                    </td>

                                    <td className="px-6 py-3 text-gray-500">{company.location || "—"}</td>
                                    <td className="px-6 py-3 text-gray-500">{company.contact_email || "—"}</td>
                                    <td className="px-6 py-3 text-gray-500">
                                        {company.website ? (
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                                                Visit
                                            </a>
                                        ) : "—"}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${company.verified_status === "verified"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {company.verified_status === "verified" ? "Verified" : "Unverified"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{formatDate(company.created_at)}</td>
                                    <td className="px-6 py-3">
                                        <button
                                            onClick={() => toggleVerification(company.id, company.verified_status)}
                                            disabled={togglingCompanyId === company.id}
                                            className={`px-3 py-1 rounded text-xs font-medium transition mr-2 ${company.verified_status === "verified"
                                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                } disabled:opacity-50`}
                                        >
                                            {togglingCompanyId === company.id ? "Updating..." : (company.verified_status === "verified" ? "Revoke" : "Verify")}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedCompany(company);
                                                fetchCompanyDocuments(company.id);
                                                setShowDocsModal(true);
                                            }}
                                            className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                        >
                                            View Docs
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );

    const renderUsersTab = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Users</h2>
                        <p className="text-sm text-gray-500">All registered users and their roles</p>
                    </div>
                    <div className="text-sm bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                        Total: {totalUsers}
                    </div>
                </div>
            </div>
            {loadingUsers ? (
                <div className="p-8 text-center text-gray-500">Loading users...</div>
            ) : errorUsers ? (
                <div className="p-8 text-center text-red-500">Error: {errorUsers}</div>
            ) : users.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No users found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">ID</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Full Name</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Email</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Role</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((userItem) => (
                                <tr key={userItem.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 text-gray-500">{userItem.id}</td>
                                    <td className="px-6 py-3 font-medium text-gray-800">{getFullName(userItem.first_name, userItem.last_name)}</td>
                                    <td className="px-6 py-3 text-gray-500">{userItem.email}</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${userItem.role === "admin" ? "bg-red-100 text-red-700" :
                                            userItem.role === "employer" ? "bg-blue-100 text-blue-700" :
                                                userItem.role === "deployment_officer" ? "bg-purple-100 text-purple-700" :
                                                    "bg-gray-100 text-gray-700"
                                            }`}>
                                            {userItem.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${userItem.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {userItem.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{formatDate(userItem.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderJobsTab = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Job Postings</h2>
                        <p className="text-sm text-gray-500">All job listings across all companies</p>
                    </div>
                    <div className="text-sm bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                        Total: {totalJobs}
                    </div>
                </div>
            </div>
            {loadingJobs ? (
                <div className="p-8 text-center text-gray-500">Loading jobs...</div>
            ) : errorJobs ? (
                <div className="p-8 text-center text-red-500">Error: {errorJobs}</div>
            ) : jobs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No job postings found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">ID</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Job Title</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Company</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Location</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Salary</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Type</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-600">Posted Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 text-gray-500">{job.id}</td>
                                    <td className="px-6 py-3 font-medium text-gray-800">
                                        <div className="max-w-xs truncate" title={job.title}>{job.title}</div>
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{job.company_name || `Company #${job.company_id}`}</td>
                                    <td className="px-6 py-3 text-gray-500">{job.location || "—"}</td>
                                    <td className="px-6 py-3 text-violet-600 font-medium">{job.salary_range || "—"}</td>
                                    <td className="px-6 py-3 text-gray-500">{job.job_type || "—"}</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${job.status === "open" ? "bg-green-100 text-green-700" :
                                            job.status === "closed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{formatDate(job.posted_date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderActivityTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-700 text-sm font-medium">Total Activities</p>
                            <p className="text-3xl font-bold text-blue-800 mt-1">{activityLogs.length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-700 text-sm font-medium">Unique Actions</p>
                            <p className="text-3xl font-bold text-purple-800 mt-1">{new Set(activityLogs.map(log => log.action)).size}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-700 text-sm font-medium">System Events</p>
                            <p className="text-3xl font-bold text-green-800 mt-1">{activityLogs.filter(log => log.entity_type === "system").length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Activity Logs</h2>
                            <p className="text-sm text-gray-500">User actions, system events, and audit trail</p>
                        </div>
                        <button onClick={fetchActivityLogs} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                            Refresh Logs
                        </button>
                    </div>
                </div>
                {loadingLogs ? (
                    <div className="p-8 text-center text-gray-500">Loading activity logs...</div>
                ) : errorLogs ? (
                    <div className="p-8 text-center text-yellow-600 bg-yellow-50">
                        <p>⚠️ {errorLogs}</p>
                        <p className="text-sm mt-1">Showing mock data for demonstration.</p>
                    </div>
                ) : activityLogs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No activity logs available.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Timestamp</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Action</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Entity Type</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Entity ID</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">User ID</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activityLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                                        <td className="px-6 py-3 font-medium text-gray-800">{log.action}</td>
                                        <td className="px-6 py-3 text-gray-500">{log.entity_type || "—"}</td>
                                        <td className="px-6 py-3 text-gray-500">{log.entity_id ?? "—"}</td>
                                        <td className="px-6 py-3 text-gray-500">{log.user_id ?? "system"}</td>
                                        <td className="px-6 py-3 text-gray-600 max-w-md truncate" title={log.details ?? ""}>{log.details || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // ========== Main Layout ==========
    if (!user) {
        return <div className="min-h-screen flex items-center justify-center"><div className="text-center text-gray-500">Loading admin dashboard...</div></div>;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-500 mb-6">You don't have administrator privileges to view this page.</p>
                    <button onClick={() => navigate("/employer/dashboard")} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                        Go to Employer Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">HD</span>
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-gray-800">Honor Deployment Admin</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-gray-700 font-medium">
                        <button onClick={() => setActiveTab("companies")} className={`pb-0.5 transition-colors duration-200 cursor-pointer ${activeTab === "companies" ? "text-violet-600 border-b-2 border-violet-600" : "hover:text-violet-600"}`}>Companies</button>
                        <button onClick={() => setActiveTab("users")} className={`pb-0.5 transition-colors duration-200 cursor-pointer ${activeTab === "users" ? "text-violet-600 border-b-2 border-violet-600" : "hover:text-violet-600"}`}>Users</button>
                        <button onClick={() => setActiveTab("jobs")} className={`pb-0.5 transition-colors duration-200 cursor-pointer ${activeTab === "jobs" ? "text-violet-600 border-b-2 border-violet-600" : "hover:text-violet-600"}`}>Jobs</button>
                        <button onClick={() => setActiveTab("activity")} className={`pb-0.5 transition-colors duration-200 cursor-pointer ${activeTab === "activity" ? "text-violet-600 border-b-2 border-violet-600" : "hover:text-violet-600"}`}>Activity Logs</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-semibold text-sm">
                                {getFullName(user.first_name, user.last_name).charAt(0).toUpperCase() || "A"}
                            </div>
                            <span className="text-sm text-gray-700 hidden sm:inline">{getFullName(user.first_name, user.last_name)}</span>
                        </div>
                        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all transform hover:scale-105 cursor-pointer">Logout</button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center justify-between">
                        <div><p className="text-gray-500 text-sm">Total Companies</p><p className="text-3xl font-bold text-gray-800">{totalCompanies}</p></div>
                        <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center justify-between">
                        <div><p className="text-gray-500 text-sm">Total Users</p><p className="text-3xl font-bold text-gray-800">{totalUsers}</p></div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center justify-between">
                        <div><p className="text-gray-500 text-sm">Total Jobs</p><p className="text-3xl font-bold text-gray-800">{totalJobs}</p></div>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center justify-between">
                        <div><p className="text-gray-500 text-sm">Activities</p><p className="text-3xl font-bold text-gray-800">{activityLogs.length}</p></div>
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    {activeTab === "companies" && renderCompaniesTab()}
                    {activeTab === "users" && renderUsersTab()}
                    {activeTab === "jobs" && renderJobsTab()}
                    {activeTab === "activity" && renderActivityTab()}
                </div>
            </main>
            {showDocsModal && selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold">Documents for {selectedCompany.name}</h3>
                            <button onClick={() => setShowDocsModal(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {loadingDocs ? (
                                <p className="text-center text-gray-500">Loading documents...</p>
                            ) : companyDocs.length === 0 ? (
                                <p className="text-center text-gray-500">No documents uploaded by this company.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {companyDocs.map(doc => (
                                        <li key={doc.id} className="border rounded-lg p-3 flex flex-wrap justify-between items-center gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 capitalize">{doc.doc_type.replace(/_/g, ' ')}</p>
                                                <a href={`http://localhost:5000${doc.file_url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                                                    {doc.file_path.split('/').pop()}
                                                </a>
                                                <p className="text-xs text-gray-500 mt-1">Uploaded: {formatDateTime(doc.uploaded_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'valid' ? 'bg-green-100 text-green-700' :
                                                    doc.status === 'expired' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {doc.status}
                                                </span>
                                                {doc.status !== 'valid' && (
                                                    <button
                                                        onClick={() => updateDocumentStatus(doc.id, 'valid')}
                                                        disabled={updatingDocId === doc.id}
                                                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 disabled:opacity-50"
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                                {doc.status !== 'expired' && (
                                                    <button
                                                        onClick={() => updateDocumentStatus(doc.id, 'expired')}
                                                        disabled={updatingDocId === doc.id}
                                                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <button onClick={() => setShowDocsModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}