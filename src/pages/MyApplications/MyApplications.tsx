import { useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";

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
  status: ApplicationStatus;
  submitted_at: string;
  updated_at: string;
  job_title: string;
  company_name: string;
  documents: ApplicationDocument[];
}

interface ApplicationDocument {
  id: number;
  application_id: number;
  document_type: string;
  file_path: string;
  original_filename: string;
  mime_type: string;
  uploaded_at: string;
}

interface UserProfile {
  name?: string;
}

interface ApiApplicationsResponse {
  success?: boolean;
  data?: unknown;
  message?: string;
}

type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
type StatusFilter = ApplicationStatus | "all";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  reviewed: "bg-blue-50 text-blue-800 border-blue-200",
  shortlisted: "bg-violet-50 text-violet-800 border-violet-200",
  rejected: "bg-rose-50 text-rose-800 border-rose-200",
  hired: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const statusDescriptions: Record<ApplicationStatus, string> = {
  pending: "Your application is waiting for employer review.",
  reviewed: "The employer has opened and reviewed your application.",
  shortlisted: "You are moving forward in the hiring process.",
  rejected: "This application was not selected.",
  hired: "This application has been marked as hired.",
};

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

const documentTypeLabels: Record<string, string> = {
  passport: "Passport",
  validId: "Valid ID",
  resume: "Resume/CV",
  certEmployment: "Certificate of Employment",
  trainingCert: "Training Certificate",
  nbiClearance: "NBI Clearance",
  medicalCert: "Medical Certificate",
  oec: "OEC",
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isStatus = (value: string): value is ApplicationStatus => ["pending", "reviewed", "shortlisted", "rejected", "hired"].includes(value);

const readString = (value: unknown, fallback = "Not provided") => (
  typeof value === "string" && value.trim() ? value : fallback
);

const readNumber = (value: unknown, fallback = 0) => {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const readBoolean = (value: unknown) => value === true || value === 1 || value === "1" || value === "true";

const parseJsonArray = (value: string): unknown[] => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseSkills = (value: unknown): string[] => {
  const skills = typeof value === "string" ? parseJsonArray(value) : value;
  if (!Array.isArray(skills)) return [];

  return skills
    .filter((skill): skill is string => typeof skill === "string")
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const parseDocuments = (value: unknown): ApplicationDocument[] => {
  const documents = typeof value === "string" ? parseJsonArray(value) : value;
  if (!Array.isArray(documents)) return [];

  return documents
    .filter(isRecord)
    .map((doc) => ({
      id: readNumber(doc.id),
      application_id: readNumber(doc.application_id),
      document_type: readString(doc.document_type, "document"),
      file_path: readString(doc.file_path, ""),
      original_filename: readString(doc.original_filename, "Uploaded document"),
      mime_type: readString(doc.mime_type, "application/octet-stream"),
      uploaded_at: readString(doc.uploaded_at, ""),
    }))
    .filter((doc) => doc.file_path);
};

const normalizeStatus = (value: unknown): ApplicationStatus => {
  const status = typeof value === "string" ? value.toLowerCase() : "";
  return isStatus(status) ? status : "pending";
};

const normalizeApplication = (value: unknown): JobApplication => {
  const app = isRecord(value) ? value : {};

  return {
    id: readNumber(app.id),
    job_id: readNumber(app.job_id),
    user_id: readNumber(app.user_id),
    name: readString(app.name),
    age: readNumber(app.age),
    contact_number: readString(app.contact_number),
    address: readString(app.address),
    previous_job: readString(app.previous_job),
    years_experience: readNumber(app.years_experience),
    skills: parseSkills(app.skills),
    highest_education: readString(app.highest_education),
    worked_abroad: readBoolean(app.worked_abroad),
    start_date: readString(app.start_date, ""),
    status: normalizeStatus(app.status),
    submitted_at: readString(app.submitted_at, ""),
    updated_at: readString(app.updated_at, ""),
    job_title: readString(app.job_title, "Untitled role"),
    company_name: readString(app.company_name, "Company unavailable"),
    documents: parseDocuments(app.documents),
  };
};

const formatDate = (dateString: string, fallback = "Not set") => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDocumentType = (type: string) => (
  documentTypeLabels[type] || type.replace(/([A-Z])/g, " $1").trim()
);

const getFileUrl = (filePath: string) => {
  const normalizedPath = filePath.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
  const cleanPath = normalizedPath.replace(/^\/+/, "");
  return `${API_URL}/${cleanPath}`;
};

const getStoredUser = (): UserProfile | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);
    return isRecord(parsed) ? { name: readString(parsed.name, "User") } : null;
  } catch {
    return null;
  }
};

export default function MyApplications() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchApplications = async (signal?: AbortSignal) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiApplicationsResponse>(
        `${API_URL}/applications/my-applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        },
      );

      const responseData = response.data;
      const rawApplications = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData.data)
          ? responseData.data
          : [];

      setApplications(rawApplications.map(normalizeApplication));
    } catch (err) {
      if (axios.isCancel(err)) return;

      const message = axios.isAxiosError<ApiApplicationsResponse>(err)
        ? err.response?.data?.message || err.message
        : "Failed to load applications";

      setError(message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchApplications(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedApp(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return applications.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesSearch = !query
        || app.job_title.toLowerCase().includes(query)
        || app.company_name.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [applications, searchTerm, statusFilter]);

  const statusCounts = useMemo(
    () => applications.reduce<Record<StatusFilter, number>>((counts, app) => {
      counts.all += 1;
      counts[app.status] += 1;
      return counts;
    }, {
      all: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    }),
    [applications],
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const activeApplications = statusCounts.pending + statusCounts.reviewed + statusCounts.shortlisted;

  return (
    <UserPortalShell
      eyebrow={user?.name ? `${user.name.split(" ")[0]}'s applications` : "Application tracking"}
      title="Track every application with a cleaner status view."
      description="Review submitted roles, filter by status, and open full application details without leaving the page."
      stats={[
        { label: "Total applications", value: `${statusCounts.all}` },
        { label: "Active pipeline", value: `${activeApplications}` },
        { label: "Shortlisted", value: `${statusCounts.shortlisted}` },
        { label: "Hired", value: `${statusCounts.hired}` },
      ]}
      actions={
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-orange-50 p-5 text-center shadow-[0_18px_60px_-28px_rgba(124,58,237,0.45)] sm:min-w-80">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">Keep momentum visible</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use filters to focus on active roles and open the detail panel when you need documents or full submission data.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Browse more jobs
            <ChevronRight size={16} />
          </Link>
        </div>
      }
    >
      <section className="grid gap-8 xl:grid-cols-[0.95fr_2.05fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-600">Refine list</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Search and filter</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Narrow the list by job title, company, or current review state.
            </p>

            <label className="relative mt-5 block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search role or company"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${statusFilter === option.value
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                >
                  {option.label}
                  <span className="ml-2 text-xs opacity-80">{statusCounts[option.value]}</span>
                </button>
              ))}
            </div>

            {(searchTerm || statusFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur">
            <h3 className="text-lg font-black tracking-tight text-slate-950">Pipeline summary</h3>
            <div className="mt-5 space-y-3">
              <PipelineRow label="Pending review" value={statusCounts.pending} />
              <PipelineRow label="Reviewed" value={statusCounts.reviewed} />
              <PipelineRow label="Shortlisted" value={statusCounts.shortlisted} />
              <PipelineRow label="Rejected" value={statusCounts.rejected} />
              <PipelineRow label="Hired" value={statusCounts.hired} accent />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-red-200 bg-red-50 p-5 text-red-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Unable to load applications</p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchApplications()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-100 px-4 py-2.5 text-sm font-bold text-red-800 transition hover:bg-red-200"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <ApplicationSkeleton />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="When you apply for a role, it will appear here with its current review status."
              action={(
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  Browse jobs
                  <ChevronRight size={16} />
                </Link>
              )}
            />
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              title="No matching applications"
              description="Try another search term or reset the active status filter."
              action={(
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear filters
                </button>
              )}
            />
          ) : (
            <>
              <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-600">Application list</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Your submitted roles</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {filteredApplications.length} application{filteredApplications.length === 1 ? "" : "s"} in view.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <MiniStat label="With docs" value={`${applications.filter((app) => app.documents.length > 0).length}`} />
                    <MiniStat label="Needs review" value={`${statusCounts.pending}`} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:hidden">
                {filteredApplications.map((app) => (
                  <ApplicationCard key={app.id} app={app} onView={() => setSelectedApp(app)} />
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur lg:block">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50/90">
                    <tr>
                      <TableHeader>Position</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Applied</TableHeader>
                      <TableHeader>Start Date</TableHeader>
                      <TableHeader>Documents</TableHeader>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-5">
                          <p className="font-black text-slate-950">{app.job_title}</p>
                          <p className="mt-1 text-sm font-medium text-slate-500">{app.company_name}</p>
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">{formatDate(app.submitted_at)}</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">{formatDate(app.start_date)}</td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-700">{app.documents.length}</td>
                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center justify-center gap-1 rounded-full bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-100"
                          >
                            Details
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {
        selectedApp && (
          <ApplicationDetailsPanel
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
          />
        )
      }
    </UserPortalShell >
  );
}

function PipelineRow({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${accent ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
      <span className={`text-sm font-semibold ${accent ? "text-emerald-800" : "text-slate-600"}`}>{label}</span>
      <span className={`text-lg font-black ${accent ? "text-emerald-700" : "text-slate-950"}`}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
    </div>
  );
}

function ApplicationCard({ app, onView }: { app: JobApplication; onView: () => void }) {
  return (
    <article className="rounded-[1.8rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={app.status} />
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
              {app.documents.length} docs
            </span>
          </div>
          <h2 className="mt-4 text-lg font-black tracking-tight text-slate-950">{app.job_title}</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">{app.company_name}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InlineMeta icon={<Calendar size={16} />} label="Applied" value={formatDate(app.submitted_at)} />
        <InlineMeta icon={<Calendar size={16} />} label="Start" value={formatDate(app.start_date)} />
      </div>

      <button
        type="button"
        onClick={onView}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
      >
        View details
        <ChevronRight size={16} />
      </button>
    </article>
  );
}

function ApplicationDetailsPanel({
  application,
  onClose,
}: {
  application: JobApplication;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="application-details-title">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close application details"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),rgba(249,115,22,0.08))] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-violet-700">Application details</p>
              <h2 id="application-details-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                {application.job_title}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">{application.company_name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
              aria-label="Close details"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <StatusBadge status={application.status} />
                <p className="mt-3 text-sm text-slate-600">{statusDescriptions[application.status]}</p>
              </div>
              <div className="text-sm text-slate-500 sm:text-right">
                <p>Applied {formatDate(application.submitted_at)}</p>
                <p>Updated {formatDate(application.updated_at)}</p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>Applicant information</SectionTitle>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <DetailBox label="Full Name" value={application.name} icon={<User size={15} />} />
              <DetailBox label="Contact" value={application.contact_number} icon={<User size={15} />} />
              <DetailBox label="Experience" value={`${application.years_experience} year${application.years_experience === 1 ? "" : "s"}`} icon={<BriefcaseBusiness size={15} />} />
              <DetailBox label="Previous Job" value={application.previous_job} icon={<BriefcaseBusiness size={15} />} />
              <DetailBox label="Education" value={application.highest_education} icon={<GraduationCap size={15} />} />
              <DetailBox label="Available Start" value={formatDate(application.start_date)} icon={<Calendar size={15} />} />
              <DetailBox label="Worked Abroad" value={application.worked_abroad ? "Yes" : "No"} icon={<Globe size={15} />} />
              <DetailBox label="Location" value={application.address} icon={<MapPin size={15} />} />
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>Skills</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {application.skills.length > 0 ? (
                application.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills were included with this application.</p>
              )}
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>Uploaded documents</SectionTitle>
            {application.documents.length > 0 ? (
              <div className="mt-3 space-y-3">
                {application.documents.map((document) => (
                  <DocumentRow key={`${document.id}-${document.file_path}`} document={document} />
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">No documents available</p>
                <p className="mt-1 text-sm text-slate-500">The server did not return document records for this application.</p>
              </div>
            )}
          </section>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}

function DocumentRow({ document }: { document: ApplicationDocument }) {
  const documentUrl = getFileUrl(document.file_path);
  const documentLabel = formatDocumentType(document.document_type);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <FileText size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900">{documentLabel}</p>
          <p className="truncate text-sm text-slate-500">{document.original_filename}</p>
          <p className="mt-1 text-xs text-slate-400">Uploaded {formatDate(document.uploaded_at)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-100"
          aria-label={`View ${documentLabel}`}
        >
          <Eye size={16} />
          View
        </a>
        <a
          href={documentUrl}
          download={document.original_filename}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          aria-label={`Download ${documentLabel}`}
        >
          <Download size={16} />
          Download
        </a>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusStyles[status]}`}>
      {status === "hired" && <CheckCircle2 size={13} />}
      {statusLabels[status]}
    </span>
  );
}

function DetailBox({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function InlineMeta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">{children}</h3>;
}

function TableHeader({ children }: { children: ReactNode }) {
  return <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{children}</th>;
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 px-6 py-14 text-center shadow-[0_18px_50px_-34px_rgba(15,23,42,0.35)] backdrop-blur">
      <BriefcaseBusiness className="mx-auto h-12 w-12 text-slate-300" />
      <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-[1.8rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((cell) => (
              <div key={cell} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
