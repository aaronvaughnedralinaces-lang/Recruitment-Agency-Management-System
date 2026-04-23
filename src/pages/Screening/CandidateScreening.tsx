import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  User,
  Star,
  CheckCircle2,
  X,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";

interface Candidate {
  id: number;
  name: string;
  email: string;
  position: string;
  years_experience: number;
  score: number;
  status: "reviewed" | "shortlisted" | "rejected";
  skills: string[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CandidateScreening: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [scoreFilter, setScoreFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    const query = searchTerm.toLowerCase();
    const filtered = candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.position.toLowerCase().includes(query);

      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "high" && candidate.score >= 8) ||
        (scoreFilter === "medium" && candidate.score >= 6 && candidate.score < 8) ||
        (scoreFilter === "low" && candidate.score < 6);

      return matchesSearch && matchesScore;
    });

    setFilteredCandidates(filtered);
  }, [searchTerm, candidates, scoreFilter]);

  const fetchCandidates = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/screening/candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(response.data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreCandidate = async (candidateId: number, approved: boolean) => {
    if (!token) return;

    try {
      await axios.patch(
        `${API_URL}/api/screening/candidates/${candidateId}`,
        {
          status: approved ? "shortlisted" : "rejected",
          score: approved ? 9 : 3,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                status: approved ? "shortlisted" : "rejected",
                score: approved ? 9 : 3,
              }
            : c,
        ),
      );
    } catch (error) {
      console.error("Error updating candidate:", error);
    }
  };

  const highScoreCandidates = candidates.filter((c) => c.score >= 8).length;
  const shortlistedCandidates = candidates.filter((c) => c.status === "shortlisted").length;

  return (
    <UserPortalShell
      eyebrow="Candidate screening"
      title="Review and filter qualified candidates."
      description="Use scoring, filters, and recommendations to quickly identify top candidates for your open positions."
      stats={[
        { label: "Total candidates", value: `${candidates.length}` },
        { label: "High score", value: `${highScoreCandidates}` },
        { label: "Shortlisted", value: `${shortlistedCandidates}` },
        { label: "In progress", value: `${candidates.filter((c) => c.status === "reviewed").length}` },
      ]}
    >
      <div className="rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur overflow-hidden">
        {/* Controls */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search by name, email, or position"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                />
              </label>
            </div>

            <div className="flex gap-2">
              {(["all", "high", "medium", "low"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setScoreFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                    scoreFilter === filter
                      ? "bg-violet-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <User className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm font-bold text-slate-700">No candidates found</p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onSelect={() => setSelectedCandidate(candidate)}
                onApprove={() => handleScoreCandidate(candidate.id, true)}
                onReject={() => handleScoreCandidate(candidate.id, false)}
              />
            ))
          )}
        </div>
      </div>

      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onApprove={() => handleScoreCandidate(selectedCandidate.id, true)}
          onReject={() => handleScoreCandidate(selectedCandidate.id, false)}
        />
      )}
    </UserPortalShell>
  );
};

function CandidateCard({
  candidate,
  onSelect,
  onApprove,
  onReject,
}: {
  candidate: Candidate;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 bg-emerald-50";
    if (score >= 6) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 8) return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (score >= 6) return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-red-200 bg-red-50 text-red-700";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-black text-slate-900">{candidate.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{candidate.position}</p>
          <p className="text-sm text-slate-500">{candidate.email}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-right">
          <div className={`rounded-2xl border px-3 py-2 text-center font-bold ${getScoreBadgeClass(candidate.score)}`}>
            <div className="text-lg">{candidate.score}/10</div>
            <div className="text-xs">Score</div>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-semibold">{candidate.years_experience}</span> yrs exp
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            candidate.status === "shortlisted"
              ? "bg-emerald-50 text-emerald-700"
              : candidate.status === "rejected"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
          }`}>
            {candidate.status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-100"
        >
          View Details
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <ThumbsUp size={16} />
        </button>
        <button
          type="button"
          onClick={onReject}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          <ThumbsDown size={16} />
        </button>
      </div>
    </div>
  );
}

function CandidateDetailsModal({
  candidate,
  onClose,
  onApprove,
  onReject,
}: {
  candidate: Candidate;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900">{candidate.name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <DetailItem label="Position" value={candidate.position} />
          <DetailItem label="Email" value={candidate.email} />
          <DetailItem label="Experience" value={`${candidate.years_experience} years`} />
          <DetailItem label="Score" value={`${candidate.score}/10`} />
          <DetailItem label="Status" value={candidate.status} />
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase text-slate-400">Skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
          >
            <CheckCircle2 className="mr-2 inline" size={16} />
            Approve
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
          >
            Reject
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default CandidateScreening;
