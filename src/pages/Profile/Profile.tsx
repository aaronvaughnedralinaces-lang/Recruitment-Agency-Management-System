import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import axios from "axios";
import {
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserCircle2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserPortalShell from "../../component/UserPortalShell";

// Preserved your exact interfaces
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
  first_name?: string | null;
  last_name?: string | null;
  name?: string; 
  email: string;
  bio?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short" });
};

// Preserved your display name logic for first_name / last_name
const getDisplayName = (user: UserProfile | null) => {
  if (!user) return 'User';
  if (user.name && user.name.trim()) return user.name;
  const first = user.first_name || '';
  const last = user.last_name || '';
  const combined = `${first} ${last}`.trim();
  return combined || 'User';
};

const getInitials = (name: string) => {
  if (!name) return "US";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const calculateProfileStrength = (user: UserProfile, career: CareerEntry[], education: EducationEntry[]) => {
  let score = 25;
  if (user.bio?.trim()) score += 25;
  if (career.length > 0) score += 25;
  if (education.length > 0) score += 25;
  return score;
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [career, setCareer] = useState<CareerEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [editingCareer, setEditingCareer] = useState<CareerEntry | null>(null);
  const [careerForm, setCareerForm] = useState({
    job_title: "",
    company_name: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);
  const [educationForm, setEducationForm] = useState({
    qualification: "",
    institution: "",
    completion_date: "",
    highlights: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCareerModal(false);
        setShowEducationModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Updated with your /users/ prefix
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, getAuthHeaders());
      setUser(response.data.user);
      setCareer(response.data.career);
      setEducation(response.data.education);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Updated with your /users/ prefix
  const updateBio = async () => {
    try {
      await axios.put(`${API_URL}/users/profile/bio`, { bio: bioDraft }, getAuthHeaders());
      if (user) {
        setUser({ ...user, bio: bioDraft });
      }
      setEditingBio(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update bio");
    }
  };

  const openCareerModal = (entry?: CareerEntry) => {
    if (entry) {
      setEditingCareer(entry);
      setCareerForm({
        job_title: entry.job_title,
        company_name: entry.company_name,
        start_date: entry.start_date ? entry.start_date.split("T")[0].slice(0, 7) : "",
        end_date: entry.end_date ? entry.end_date.split("T")[0].slice(0, 7) : "",
        description: entry.description || "",
      });
    } else {
      setEditingCareer(null);
      setCareerForm({
        job_title: "",
        company_name: "",
        start_date: "",
        end_date: "",
        description: "",
      });
    }
    setShowCareerModal(true);
  };

  // Updated with your logic for "-01" concatenation and /users/ prefix
  const saveCareer = async () => {
    const payload = {
      ...careerForm,
      start_date: careerForm.start_date ? `${careerForm.start_date}-01` : null,
      end_date: careerForm.end_date ? `${careerForm.end_date}-01` : null,
    };

    try {
      if (editingCareer) {
        await axios.put(`${API_URL}/users/career/${editingCareer.id}`, payload, getAuthHeaders());
      } else {
        await axios.post(`${API_URL}/users/career`, payload, getAuthHeaders());
      }

      await fetchProfile();
      setShowCareerModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save career entry");
    }
  };

  // Updated with your /users/ prefix
  const deleteCareer = async (id: number) => {
    if (!window.confirm("Delete this career entry?")) return;

    try {
      await axios.delete(`${API_URL}/users/career/${id}`, getAuthHeaders());
      await fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const openEducationModal = (entry?: EducationEntry) => {
    if (entry) {
      setEditingEducation(entry);
      setEducationForm({
        qualification: entry.qualification,
        institution: entry.institution,
        completion_date: entry.completion_date ? entry.completion_date.split("T")[0].slice(0, 7) : "",
        highlights: entry.highlights || "",
      });
    } else {
      setEditingEducation(null);
      setEducationForm({
        qualification: "",
        institution: "",
        completion_date: "",
        highlights: "",
      });
    }
    setShowEducationModal(true);
  };

  // Updated with your logic for "-01" concatenation and /users/ prefix
  const saveEducation = async () => {
    const payload = {
      ...educationForm,
      completion_date: educationForm.completion_date ? `${educationForm.completion_date}-01` : null,
    };

    try {
      if (editingEducation) {
        await axios.put(`${API_URL}/users/education/${editingEducation.id}`, payload, getAuthHeaders());
      } else {
        await axios.post(`${API_URL}/users/education`, payload, getAuthHeaders());
      }

      await fetchProfile();
      setShowEducationModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save education entry");
    }
  };

  // Updated with your /users/ prefix
  const deleteEducation = async (id: number) => {
    if (!window.confirm("Delete this education entry?")) return;

    try {
      await axios.delete(`${API_URL}/users/education/${id}`, getAuthHeaders());
      await fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">User not found</div>;
  }

  const profileStrength = calculateProfileStrength(user, career, education);
  const currentRole = career[0]?.job_title || "Add your current role";
  const displayName = getDisplayName(user); // using your merged name logic

  return (
    <UserPortalShell
      eyebrow="Personal profile"
      title="Present your experience with sharper structure."
      description="Keep your summary, work history, and education organized in one polished profile so applications feel faster and more credible."
      stats={[
        { label: "Profile strength", value: `${profileStrength}%` },
        { label: "Experience entries", value: `${career.length}` },
        { label: "Education entries", value: `${education.length}` },
        { label: "Current headline", value: currentRole },
      ]}
      actions={
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-orange-50 p-5 text-center shadow-[0_18px_60px_-28px_rgba(124,58,237,0.45)] sm:min-w-80">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">Profile quality matters</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Strong summaries and complete timelines help recruiters understand your fit much faster.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-600 text-3xl font-black text-white shadow-[0_18px_45px_-20px_rgba(124,58,237,0.55)]">
              {getInitials(displayName)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-violet-700">Candidate profile</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {displayName}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <MetaPill icon={<Mail size={15} />} value={user.email} />
                    <MetaPill icon={<BriefcaseBusiness size={15} />} value={currentRole} />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Profile strength</p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-3xl font-black text-slate-950">{profileStrength}%</span>
                    <span className="pb-1 text-sm font-semibold text-slate-500">complete</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-orange-500"
                      style={{ width: `${profileStrength}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Professional summary</p>
                    <p className="mt-1 text-sm text-slate-500">Use this space to quickly frame your experience and direction.</p>
                  </div>
                  {!editingBio && (
                    <button
                      type="button"
                      onClick={() => {
                        setBioDraft(user.bio || "");
                        setEditingBio(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-100"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>
                  )}
                </div>

                {!editingBio ? (
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                    {user.bio || "No summary added yet. Add a focused overview of your background, strengths, and target role."}
                  </p>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      rows={5}
                      value={bioDraft}
                      onChange={(event) => setBioDraft(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                      placeholder="Write a concise summary of your background, achievements, and career direction."
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingBio(false)}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={updateBio}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                      >
                        <Save size={16} />
                        Save summary
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <InsightCard
            icon={<UserCircle2 size={18} />}
            title="What recruiters see first"
            description="Your summary and latest role shape first impressions. Keep both specific and current."
          />
          <InsightCard
            icon={<CheckCircle2 size={18} />}
            title="Best next improvement"
            description={user.bio?.trim() ? "Your summary is in place. Add more outcome-focused details to each role." : "Add a short professional summary to improve profile clarity immediately."}
          />
          <InsightCard
            icon={<GraduationCap size={18} />}
            title="Profile completeness"
            description={`${career.length} experience entr${career.length === 1 ? "y" : "ies"} and ${education.length} education entr${education.length === 1 ? "y" : "ies"} currently listed.`}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <TimelineSection
          title="Experience"
          subtitle="Show the arc of your work with concise, outcome-oriented descriptions."
          icon={<BriefcaseBusiness size={20} />}
          buttonLabel="Add role"
          buttonTone="violet"
          onAdd={() => openCareerModal()}
          emptyIcon={<BriefcaseBusiness className="h-10 w-10 text-slate-300" />}
          emptyTitle="No experience added yet"
          emptyDescription="Add your current and previous roles so your profile reads like a complete story."
        >
          {career.length === 0 ? null : (
            <div className="relative space-y-6 pl-6 sm:pl-8">
              <div className="absolute left-2 top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-violet-200 via-slate-200 to-transparent sm:left-3" />
              {career.map((entry) => (
                <TimelineItem
                  key={entry.id}
                  accent="violet"
                  title={entry.job_title}
                  subtitle={entry.company_name}
                  timeframe={`${formatDate(entry.start_date)} - ${entry.end_date ? formatDate(entry.end_date) : "Present"}`}
                  content={entry.description}
                  onEdit={() => openCareerModal(entry)}
                  onDelete={() => deleteCareer(entry.id)}
                />
              ))}
            </div>
          )}
        </TimelineSection>

        <TimelineSection
          title="Education"
          subtitle="Capture your qualifications, certifications, and relevant highlights."
          icon={<GraduationCap size={20} />}
          buttonLabel="Add education"
          buttonTone="indigo"
          onAdd={() => openEducationModal()}
          emptyIcon={<GraduationCap className="h-10 w-10 text-slate-300" />}
          emptyTitle="No education added yet"
          emptyDescription="List your academic background, certifications, or training milestones."
        >
          {education.length === 0 ? null : (
            <div className="relative space-y-6 pl-6 sm:pl-8">
              <div className="absolute left-2 top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent sm:left-3" />
              {education.map((entry) => (
                <TimelineItem
                  key={entry.id}
                  accent="indigo"
                  title={entry.qualification}
                  subtitle={entry.institution}
                  timeframe={`Completed ${formatDate(entry.completion_date)}`}
                  content={entry.highlights}
                  onEdit={() => openEducationModal(entry)}
                  onDelete={() => deleteEducation(entry.id)}
                />
              ))}
            </div>
          )}
        </TimelineSection>
      </section>

      {showCareerModal && (
        <FormModal
          title={editingCareer ? "Edit role" : "Add experience"}
          onClose={() => setShowCareerModal(false)}
          onSubmit={(event) => {
            event.preventDefault();
            saveCareer();
          }}
          submitLabel="Save role"
          submitTone="violet"
        >
          <FormField label="Job title">
            <input
              type="text"
              required
              value={careerForm.job_title}
              onChange={(event) => setCareerForm({ ...careerForm, job_title: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Senior Frontend Engineer"
            />
          </FormField>
          <FormField label="Company">
            <input
              type="text"
              required
              value={careerForm.company_name}
              onChange={(event) => setCareerForm({ ...careerForm, company_name: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              placeholder="Acme Corporation"
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Start date">
              <input
                type="month"
                required
                value={careerForm.start_date}
                onChange={(event) => setCareerForm({ ...careerForm, start_date: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              />
            </FormField>
            <FormField label="End date">
              <input
                type="month"
                value={careerForm.end_date}
                onChange={(event) => setCareerForm({ ...careerForm, end_date: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              />
            </FormField>
          </div>
          <p className="-mt-2 text-xs font-medium text-slate-500">Leave end date empty if this is your current role.</p>
          <FormField label="Impact and responsibilities">
            <textarea
              rows={5}
              value={careerForm.description || ""}
              onChange={(event) => setCareerForm({ ...careerForm, description: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 resize-none"
              placeholder="Describe what you owned, delivered, and improved."
            />
          </FormField>
        </FormModal>
      )}

      {showEducationModal && (
        <FormModal
          title={editingEducation ? "Edit education" : "Add education"}
          onClose={() => setShowEducationModal(false)}
          onSubmit={(event) => {
            event.preventDefault();
            saveEducation();
          }}
          submitLabel="Save education"
          submitTone="indigo"
        >
          <FormField label="Degree or certificate">
            <input
              type="text"
              required
              value={educationForm.qualification}
              onChange={(event) => setEducationForm({ ...educationForm, qualification: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="B.S. Computer Science"
            />
          </FormField>
          <FormField label="Institution">
            <input
              type="text"
              required
              value={educationForm.institution}
              onChange={(event) => setEducationForm({ ...educationForm, institution: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="Stanford University"
            />
          </FormField>
          <FormField label="Completion date">
            <input
              type="month"
              required
              value={educationForm.completion_date}
              onChange={(event) => setEducationForm({ ...educationForm, completion_date: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </FormField>
          <FormField label="Highlights">
            <textarea
              rows={5}
              value={educationForm.highlights || ""}
              onChange={(event) => setEducationForm({ ...educationForm, highlights: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 resize-none"
              placeholder="Honors, thesis, GPA, relevant coursework, or major achievements."
            />
          </FormField>
        </FormModal>
      )}
    </UserPortalShell>
  );
}

// -------------------------------------------------------------
// UI Helper Components 
// -------------------------------------------------------------

function InsightCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-black tracking-tight text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function MetaPill({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
      {icon}
      {value}
    </span>
  );
}

function TimelineSection({
  title,
  subtitle,
  icon,
  buttonLabel,
  buttonTone,
  onAdd,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  buttonLabel: string;
  buttonTone: "violet" | "indigo";
  onAdd: () => void;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  children: ReactNode;
}) {
  const buttonClass =
    buttonTone === "violet"
      ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100";

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${buttonTone === "violet" ? "bg-violet-50 text-violet-700" : "bg-indigo-50 text-indigo-700"}`}>
              {icon}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${buttonClass}`}
        >
          <Plus size={16} />
          {buttonLabel}
        </button>
      </div>

      <div className="mt-8">
        {children || (
          <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white">
              {emptyIcon}
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900">{emptyTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function TimelineItem({
  accent,
  title,
  subtitle,
  timeframe,
  content,
  onEdit,
  onDelete,
}: {
  accent: "violet" | "indigo";
  title: string;
  subtitle: string;
  timeframe: string;
  content: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accentClasses =
    accent === "violet"
      ? "border-violet-500 text-violet-700 bg-violet-50"
      : "border-indigo-500 text-indigo-700 bg-indigo-50";

  return (
    <div className="relative">
      <div className={`absolute left-[-1.1rem] top-6 h-5 w-5 rounded-full border-4 bg-white sm:left-[-1.35rem] ${accent === "violet" ? "border-violet-500" : "border-indigo-500"}`} />
      <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.32)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] ${accentClasses}`}>
              <Calendar size={13} />
              {timeframe}
            </div>
            <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950">{title}</h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <MapPin size={15} />
              {subtitle}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        {content && (
          <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            {content}
          </p>
        )}
      </article>
    </div>
  );
}

function FormModal({
  title,
  onClose,
  onSubmit,
  submitLabel,
  submitTone,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  submitTone: "violet" | "indigo";
  children: ReactNode;
}) {
  const submitClass = submitTone === "violet" ? "bg-violet-600 hover:bg-violet-700" : "bg-indigo-600 hover:bg-indigo-700";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close modal" />
      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/30 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h3 className="text-2xl font-black tracking-tight text-slate-950">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          {children}
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${submitClass}`}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}