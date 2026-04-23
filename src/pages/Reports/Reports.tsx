import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  Trash2,
  Plus,
  Filter,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";

interface Report {
  id: number;
  name: string;
  type: "recruitment" | "candidate" | "performance";
  generated_date: string;
  file_path: string;
  period: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"saved" | "generate" | "schedule">("saved");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const tabs = [
    { id: "saved", label: "Saved Reports", count: reports.length },
    { id: "generate", label: "Generate New", count: 0 },
    { id: "schedule", label: "Schedule", count: 0 },
  ];

  return (
    <UserPortalShell
      eyebrow="Reports & analytics"
      title="Generate and manage recruitment reports."
      description="Create custom reports on recruitment metrics, candidate performance, and hiring trends."
      stats={[
        { label: "Total reports", value: `${reports.length}` },
        { label: "Recruitment", value: `${reports.filter((r) => r.type === "recruitment").length}` },
        { label: "Candidate", value: `${reports.filter((r) => r.type === "candidate").length}` },
        { label: "Performance", value: `${reports.filter((r) => r.type === "performance").length}` },
      ]}
    >
      <div className="rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "saved" | "generate" | "schedule")}
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
          {activeTab === "saved" && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600" />
                </div>
              ) : reports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-sm font-bold text-slate-700">No reports yet</p>
                  <p className="text-xs text-slate-500">Generate your first report to get started</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                        <BarChart3 size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">{report.name}</h3>
                        <div className="mt-1 flex gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(report.generated_date).toLocaleDateString()}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5">
                            {report.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <a
                        href={`${API_URL}/${report.file_path}`}
                        download
                        className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-100 flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(report.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "generate" && (
            <GenerateReportForm onSuccess={fetchReports} />
          )}

          {activeTab === "schedule" && (
            <ScheduleReportForm />
          )}
        </div>
      </div>
    </UserPortalShell>
  );
};

function GenerateReportForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "recruitment" as "recruitment" | "candidate" | "performance",
    period: "month",
  });
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setGenerating(true);
      await axios.post(`${API_URL}/api/reports/generate`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
      setFormData({
        name: "",
        type: "recruitment",
        period: "month",
      });
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700">Report Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
          placeholder="e.g., July Recruitment Summary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700">Report Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as "recruitment" | "candidate" | "performance" })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
          >
            <option value="recruitment">Recruitment</option>
            <option value="candidate">Candidate</option>
            <option value="performance">Performance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700">Period</label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={generating}
        className="w-full rounded-lg bg-violet-600 px-4 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        <Plus className="mr-2 inline" size={18} />
        {generating ? "Generating..." : "Generate Report"}
      </button>
    </form>
  );
}

function ScheduleReportForm() {
  const [formData, setFormData] = useState({
    name: "",
    type: "recruitment" as "recruitment" | "candidate" | "performance",
    frequency: "monthly",
    recipients: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(`${API_URL}/api/reports/schedule`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Report scheduled successfully!");
      setFormData({
        name: "",
        type: "recruitment",
        frequency: "monthly",
        recipients: "",
      });
    } catch (error) {
      console.error("Error scheduling report:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700">Report Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
          placeholder="e.g., Monthly Recruitment Summary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700">Report Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as "recruitment" | "candidate" | "performance" })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
          >
            <option value="recruitment">Recruitment</option>
            <option value="candidate">Candidate</option>
            <option value="performance">Performance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700">Frequency</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700">Recipients (comma-separated)</label>
        <input
          type="text"
          value={formData.recipients}
          onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
          placeholder="email@example.com, another@example.com"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700"
      >
        <Clock className="mr-2 inline" size={18} />
        Schedule Report
      </button>
    </form>
  );
}

export default Reports;
