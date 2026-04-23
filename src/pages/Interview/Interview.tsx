import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Plus,
  Star,
  Video,
  ChevronRight,
  X,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";

interface ScheduledInterview {
  id: number;
  job_id: number;
  candidate_name: string;
  interview_type: "phone" | "video" | "in-person";
  scheduled_date: string;
  scheduled_time: string;
  location?: string;
  meeting_link?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
}

interface InterviewFeedback {
  id: number;
  interview_id: number;
  communication_score: number;
  technical_score: number;
  culture_fit_score: number;
  strengths: string;
  weaknesses: string;
  recommendation: "hire" | "maybe" | "reject";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Interview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"list" | "schedule" | "feedback">("list");
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<ScheduledInterview | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/interviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviews(response.data || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "list", label: "My Interviews", count: interviews.length },
    { id: "schedule", label: "Schedule Interview", count: 0 },
    { id: "feedback", label: "Add Feedback", count: 0 },
  ];

  return (
    <UserPortalShell
      eyebrow="Interview management"
      title="Schedule and track your interviews."
      description="View scheduled interviews, record feedback scores, and manage the interview pipeline."
      stats={[
        { label: "Total interviews", value: `${interviews.length}` },
        { label: "Scheduled", value: `${interviews.filter((i) => i.status === "scheduled").length}` },
        { label: "Completed", value: `${interviews.filter((i) => i.status === "completed").length}` },
        { label: "Cancelled", value: `${interviews.filter((i) => i.status === "cancelled").length}` },
      ]}
    >
      <div className="rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "list" | "schedule" | "feedback")}
              className={`flex-1 border-b-2 px-4 py-4 text-center font-bold transition ${
                activeTab === tab.id
                  ? "border-violet-600 bg-white text-violet-700"
                  : "border-transparent text-slate-600 hover:bg-white"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "list" && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600" />
                </div>
              ) : interviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-sm font-bold text-slate-700">No interviews scheduled yet</p>
                </div>
              ) : (
                interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900">{interview.candidate_name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <p className="flex items-center gap-2">
                            <Clock size={16} />
                            {new Date(interview.scheduled_date).toLocaleDateString()} at {interview.scheduled_time}
                          </p>
                          {interview.location && (
                            <p className="flex items-center gap-2">
                              <MapPin size={16} />
                              {interview.location}
                            </p>
                          )}
                          {interview.meeting_link && (
                            <p className="flex items-center gap-2">
                              <Video size={16} />
                              <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline">
                                Join meeting
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedInterview(interview)}
                        className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-100"
                      >
                        Details
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          interview.status === "scheduled"
                            ? "bg-blue-50 text-blue-700"
                            : interview.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {interview.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {interview.interview_type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "schedule" && (
            <ScheduleInterviewForm onSuccess={fetchInterviews} />
          )}

          {activeTab === "feedback" && (
            <InterviewFeedbackForm interviews={interviews} />
          )}
        </div>
      </div>

      {selectedInterview && (
        <InterviewDetailsModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </UserPortalShell>
  );
};

function ScheduleInterviewForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    candidate_name: "",
    interview_type: "phone" as "phone" | "video" | "in-person",
    scheduled_date: "",
    scheduled_time: "",
    location: "",
    meeting_link: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/interviews`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
      setFormData({
        candidate_name: "",
        interview_type: "phone",
        scheduled_date: "",
        scheduled_time: "",
        location: "",
        meeting_link: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error scheduling interview:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-bold text-slate-700">Candidate Name</label>
        <input
          type="text"
          value={formData.candidate_name}
          onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700">Interview Type</label>
          <select
            value={formData.interview_type}
            onChange={(e) => setFormData({ ...formData, interview_type: e.target.value as "phone" | "video" | "in-person" })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="phone">Phone</option>
            <option value="video">Video</option>
            <option value="in-person">In-Person</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700">Date</label>
          <input
            type="date"
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700">Time</label>
          <input
            type="time"
            value={formData.scheduled_time}
            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700">Location/Link</label>
          <input
            type="text"
            value={formData.location || formData.meeting_link}
            onChange={(e) => setFormData({ ...formData, location: e.target.value, meeting_link: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Address or meeting link"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          rows={3}
          placeholder="Additional interview notes..."
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-700"
      >
        <Plus size={18} className="mr-2 inline" />
        Schedule Interview
      </button>
    </form>
  );
}

function InterviewFeedbackForm({ interviews }: { interviews: ScheduledInterview[] }) {
  const [selectedInterview, setSelectedInterview] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    communication_score: 5,
    technical_score: 5,
    culture_fit_score: 5,
    strengths: "",
    weaknesses: "",
    recommendation: "maybe" as "hire" | "maybe" | "reject",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !selectedInterview) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/interviews/${selectedInterview}/feedback`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFormData({
        communication_score: 5,
        technical_score: 5,
        culture_fit_score: 5,
        strengths: "",
        weaknesses: "",
        recommendation: "maybe",
      });
      setSelectedInterview(null);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-bold text-slate-700">Select Interview</label>
        <select
          value={selectedInterview || ""}
          onChange={(e) => setSelectedInterview(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Choose an interview...</option>
          {interviews.map((interview) => (
            <option key={interview.id} value={interview.id}>
              {interview.candidate_name} - {new Date(interview.scheduled_date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedInterview && (
        <>
          <div className="space-y-3">
            <ScoreInput
              label="Communication"
              value={formData.communication_score}
              onChange={(v) => setFormData({ ...formData, communication_score: v })}
            />
            <ScoreInput
              label="Technical Skills"
              value={formData.technical_score}
              onChange={(v) => setFormData({ ...formData, technical_score: v })}
            />
            <ScoreInput
              label="Culture Fit"
              value={formData.culture_fit_score}
              onChange={(v) => setFormData({ ...formData, culture_fit_score: v })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700">Strengths</label>
            <textarea
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700">Areas for Improvement</label>
            <textarea
              value={formData.weaknesses}
              onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700">Recommendation</label>
            <div className="mt-2 flex gap-2">
              {(["hire", "maybe", "reject"] as const).map((rec) => (
                <button
                  key={rec}
                  type="button"
                  onClick={() => setFormData({ ...formData, recommendation: rec })}
                  className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    formData.recommendation === rec
                      ? "bg-violet-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {rec.charAt(0).toUpperCase() + rec.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
          >
            Submit Feedback
          </button>
        </>
      )}
    </form>
  );
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <span className="text-lg font-bold text-violet-600">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
      />
    </div>
  );
}

function InterviewDetailsModal({
  interview,
  onClose,
}: {
  interview: ScheduledInterview;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900">{interview.candidate_name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <DetailRow
            icon={<Calendar size={16} />}
            label="Date"
            value={new Date(interview.scheduled_date).toLocaleDateString()}
          />
          <DetailRow icon={<Clock size={16} />} label="Time" value={interview.scheduled_time} />
          <DetailRow
            icon={<Video size={16} />}
            label="Type"
            value={interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)}
          />
          {interview.location && (
            <DetailRow icon={<MapPin size={16} />} label="Location" value={interview.location} />
          )}
          {interview.notes && (
            <DetailRow icon={<MessageSquare size={16} />} label="Notes" value={interview.notes} />
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-950 px-4 py-2 font-bold text-white hover:bg-violet-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-500">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
        <p className="mt-1 font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default Interview;
