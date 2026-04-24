import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  MapPin,
  Sparkles,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";
import { getLogoUrl } from "../../utils/logoUtils";

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

// Preserved your explicit User interface
interface User {
  id: number;
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  contact_number?: string;
}

type DocumentKey =
  | "passport"
  | "validId"
  | "resume"
  | "certEmployment"
  | "trainingCert"
  | "nbiClearance"
  | "medicalCert"
  | "oec";

const documentLabels: Record<DocumentKey, string> = {
  passport: "Passport",
  validId: "Valid ID",
  resume: "Resume / CV",
  certEmployment: "Certificate of Employment",
  trainingCert: "Training Certificate",
  nbiClearance: "NBI Clearance",
  medicalCert: "Medical Certificate",
  oec: "OEC (DMW)",
};

const requiredDocs: DocumentKey[] = [
  "passport",
  "validId",
  "resume",
  "certEmployment",
  "nbiClearance",
  "medicalCert",
  "oec",
];

const formFields = [
  "name",
  "age",
  "contactNumber",
  "address",
  "previousJob",
  "yearsExperience",
  "highestEducation",
  "startDate",
] as const;

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getJobTypeLabel = (type: Job["job_type"]) => {
  const labels: Record<Job["job_type"], string> = {
    "full-time": "Full Time",
    "part-time": "Part Time",
    contract: "Contract",
    internship: "Internship",
  };
  return labels[type];
};

// Preserved your robust display name logic
const getDisplayName = (user: User | null): string => {
  if (!user) return "";
  if (user.name && user.name.trim()) return user.name;
  const first = user.first_name || "";
  const last = user.last_name || "";
  return `${first} ${last}`.trim() || "";
};

export default function ApplyPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "" as number | "",
    contactNumber: "",
    address: "",
    previousJob: "",
    yearsExperience: "" as number | "",
    highestEducation: "",
    workedAbroad: null as boolean | null,
    startDate: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [documents, setDocuments] = useState<Record<DocumentKey, File | null>>({
    passport: null,
    validId: null,
    resume: null,
    certEmployment: null,
    trainingCert: null,
    nbiClearance: null,
    medicalCert: null,
    oec: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
      setFormData((prev) => ({
        ...prev,
        name: getDisplayName(parsedUser),
        contactNumber: parsedUser.contact_number || "",
      }));
    }

    if (jobId) {
      fetchJobDetails(token, parseInt(jobId, 10));
    } else {
      setNotification({ type: "error", message: "Invalid job ID." });
      setLoadingJob(false);
    }
  }, [jobId, navigate]);

  // Preserved hitting your public job route
  const fetchJobDetails = async (token: string, id: number) => {
    try {
      const response = await fetch(`/api/public/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load job details");
      const data = await response.json();
      setJob(data);
    } catch {
      setNotification({ type: "error", message: "Could not load job information. Please try again." });
    } finally {
      setLoadingJob(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : "") : value,
    }));
  };

  const handleFileChange = (key: DocumentKey, file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setNotification({ type: "error", message: `${documentLabels[key]} exceeds the 5MB limit.` });
      return;
    }

    setNotification(null);
    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  const removeFile = (key: DocumentKey) => {
    setDocuments((prev) => ({ ...prev, [key]: null }));
  };

  const uploadedRequiredDocs = useMemo(
    () => requiredDocs.filter((key) => documents[key] !== null).length,
    [documents],
  );

  const filledFields = useMemo(() => {
    let count = formFields.filter((key) => formData[key] !== "").length;
    if (formData.workedAbroad !== null) count += 1;
    return count;
  }, [formData]);

  const totalRequired = formFields.length + 1 + requiredDocs.length;
  const completion = Math.round(((filledFields + uploadedRequiredDocs) / totalRequired) * 100);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setNotification(null);

    // Validate required fields
    if (!formData.name || !formData.age || !formData.contactNumber || !formData.address || 
        !formData.previousJob || formData.yearsExperience === "" || !formData.highestEducation || 
        !formData.startDate || formData.workedAbroad === null) {
      setNotification({ type: "error", message: "Please fill in all required fields." });
      setSubmitting(false);
      return;
    }

    if (uploadedRequiredDocs < requiredDocs.length) {
      setNotification({ type: "error", message: `Please upload all ${requiredDocs.length} required documents.` });
      setSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    // Preserved your explicit, safe payload construction
    const payload = new FormData();
    payload.append("job_id", jobId || "");
    payload.append("name", formData.name);
    payload.append("age", String(formData.age));
    payload.append("contact_number", formData.contactNumber);
    payload.append("address", formData.address);
    payload.append("previous_job", formData.previousJob);
    payload.append("years_experience", String(formData.yearsExperience));
    payload.append("highest_education", formData.highestEducation);
    payload.append("worked_abroad", formData.workedAbroad ? "1" : "0");
    payload.append("start_date", formData.startDate);
    payload.append("skills", JSON.stringify(skills));

    // Preserved your specific documentTypes array logic for the backend
    const documentTypes: string[] = [];
    (Object.keys(documents) as DocumentKey[]).forEach((field) => {
      if (documents[field]) {
        payload.append('documents', documents[field] as File);
        documentTypes.push(field);
      }
    });
    
    if (documentTypes.length > 0) {
      payload.append('documentTypes', JSON.stringify(documentTypes));
    }

    try {
      const response = await fetch("/api/applications/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit application. Please check your inputs.");
      }

      setNotification({ type: "success", message: "Application submitted successfully. Redirecting..." });
      setTimeout(() => navigate("/my-applications"), 1800);
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Preparing application...</p>
        </div>
      </div>
    );
  }

  return (
    <UserPortalShell
      eyebrow={getDisplayName(user) ? `Applying as ${getDisplayName(user).split(" ")[0]}` : "Application form"}
      title={job ? `Apply for ${job.title} with a cleaner, guided form.` : "Complete your application"}
      description="Work through the form in a steady flow, upload required documents, and keep an eye on completion before submitting."
      stats={[
        { label: "Completion", value: `${completion}%` },
        { label: "Required docs", value: `${uploadedRequiredDocs}/${requiredDocs.length}` },
        { label: "Skills added", value: `${skills.length}` },
        { label: "Target role", value: job?.job_type ? getJobTypeLabel(job.job_type) : "Application" },
      ]}
      actions={
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-orange-50 p-5 text-center shadow-[0_18px_60px_-28px_rgba(124,58,237,0.45)] sm:min-w-80">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">Simple application flow</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fill each section once, attach your documents, then review the summary card before submitting.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>
      }
    >
      <section className="mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-orange-50 text-2xl font-black text-violet-700">
            {job?.company_logo ? (
              <img
                src={getLogoUrl(job.company_logo)}
                alt={job.company_name}
                className="h-full w-full object-cover"
              />
            ) : (
              job?.company_name?.charAt(0).toUpperCase() || "J"
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              {job?.job_type && (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
                  {getJobTypeLabel(job.job_type)}
                </span>
              )}
              {job?.closing_date && (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
                  Closes {formatDate(job.closing_date)}
                </span>
              )}
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{job?.title}</h2>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                <BriefcaseBusiness size={15} />
                {job?.company_name}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                <MapPin size={15} />
                {job?.location || "Remote / Flexible"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                <CalendarDays size={15} />
                Posted {job?.posted_date ? formatDate(job.posted_date) : "Recently"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[1.8fr_0.95fr]">
        <div className="space-y-8">
          <FormSection
            step="1"
            title="Personal information"
            description="Provide the essentials exactly as they should appear on your application."
            accent="violet"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Full name" required>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Juan Dela Cruz"
                />
              </FormField>
              <FormField label="Age" required>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="28"
                />
              </FormField>
              <FormField label="Contact number" required>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="+63 912 345 6789"
                />
              </FormField>
              <FormField label="Highest education" required>
                <select
                  id="highestEducation"
                  name="highestEducation"
                  required
                  value={formData.highestEducation}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                >
                  <option value="" disabled>Select highest attainment</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                  <option value="Master's Degree">Master&apos;s Degree</option>
                  <option value="Vocational/Trade">Vocational / Trade</option>
                </select>
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Full address" required>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    placeholder="123 Main St, Brgy, City, Province"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          <FormSection
            step="2"
            title="Professional background"
            description="Summarize your latest role, experience, and availability."
            accent="orange"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Most recent job title" required>
                <input
                  id="previousJob"
                  name="previousJob"
                  type="text"
                  required
                  value={formData.previousJob}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Software Engineer"
                />
              </FormField>
              <FormField label="Years of experience" required>
                <input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={formData.yearsExperience}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="3"
                />
              </FormField>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Worked abroad? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, workedAbroad: true })}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${formData.workedAbroad === true
                        ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-500/10"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, workedAbroad: false })}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${formData.workedAbroad === false
                        ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-500/10"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <FormField label="Earliest start date" required>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Key skills and competencies">
                  <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-3 transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/10">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
                          {skill}
                          <button
                            type="button"
                            onClick={() => setSkills(skills.filter((entry) => entry !== skill))}
                            className="text-slate-400 transition hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      <input
                        id="skills"
                        value={skillInput}
                        onChange={(event) => setSkillInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            const next = skillInput.trim();
                            if (next && !skills.includes(next)) {
                              setSkills([...skills, next]);
                              setSkillInput("");
                            }
                          }
                        }}
                        className="min-w-[180px] flex-1 bg-transparent px-2 py-2 text-sm text-slate-700 outline-none"
                        placeholder="Type a skill and press Enter"
                      />
                    </div>
                  </div>
                </FormField>
              </div>
            </div>
          </FormSection>

          <FormSection
            step="3"
            title="Required documents"
            description="Upload the files needed for a complete submission. Files must be PDF, JPG, or PNG and under 5MB."
            accent="emerald"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.entries(documentLabels) as Array<[DocumentKey, string]>).map(([key, label]) => {
                const isRequired = requiredDocs.includes(key);
                const currentFile = documents[key];

                return (
                  <div key={key} className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                      {label} {isRequired && <span className="text-red-500">*</span>}
                    </p>

                    {!currentFile ? (
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-violet-300 hover:bg-violet-50/40">
                        <Upload className="h-6 w-6 text-slate-400" />
                        <p className="mt-3 text-sm font-bold text-slate-700">Click to upload</p>
                        <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG</p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(event) => handleFileChange(key, event.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-emerald-200 bg-emerald-50/70 p-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600">
                            <FileCheck2 size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">{currentFile.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatBytes(currentFile.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(key)}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
                          title="Remove file"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </FormSection>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur">
            <h3 className="text-xl font-black tracking-tight text-slate-950">Application summary</h3>
            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Completion</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{completion}%</p>
                </div>
                <p className="text-sm font-semibold text-violet-700">{filledFields + uploadedRequiredDocs}/{totalRequired} items</p>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-slate-200">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-orange-500 transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <SummaryRow icon={<UserCircle2 size={16} />} label="Core profile fields" value={`${filledFields}/${formFields.length + 1}`} />
              <SummaryRow icon={<FileText size={16} />} label="Required documents" value={`${uploadedRequiredDocs}/${requiredDocs.length}`} />
              <SummaryRow icon={<GraduationCap size={16} />} label="Skills listed" value={`${skills.length}`} />
            </div>

            {notification && (
              <div className={`mt-5 rounded-[1.4rem] border p-4 text-sm font-medium ${notification.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}>
                <div className="flex items-start gap-3">
                  {notification.type === "error" ? (
                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{notification.message}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || completion < 100}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit application
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              Submission stays disabled until all required fields and required documents are complete.
            </p>
          </div>

          {job && (
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur">
              <h3 className="text-lg font-black tracking-tight text-slate-950">Role snapshot</h3>
              <div className="mt-5 space-y-3">
                <SummaryRow icon={<MapPin size={16} />} label="Location" value={job.location || "Remote / Flexible"} />
                <SummaryRow icon={<BriefcaseBusiness size={16} />} label="Company" value={job.company_name} />
                <SummaryRow icon={<CalendarDays size={16} />} label="Posted" value={formatDate(job.posted_date)} />
              </div>
            </div>
          )}
        </aside>
      </form>
    </UserPortalShell>
  );
}

function FormSection({
  step,
  title,
  description,
  accent,
  children,
}: {
  step: string;
  title: string;
  description: string;
  accent: "violet" | "orange" | "emerald";
  children: ReactNode;
}) {
  const accentClasses = {
    violet: "bg-violet-100 text-violet-700",
    orange: "bg-orange-100 text-orange-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8">
      <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${accentClasses[accent]}`}>
          {step}
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <span className="text-right text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}