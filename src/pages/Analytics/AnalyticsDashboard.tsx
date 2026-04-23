import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  LineChart,
  Users,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";

interface MetricData {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
  hired_count: number;
}

interface TrendData {
  date: string;
  applications: number;
}

interface JobPerformance {
  job_id: number;
  job_title: string;
  total_applications: number;
  approved: number;
  hired: number;
  conversion_rate: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "jobs">("overview");
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [jobPerformance, setJobPerformance] = useState<JobPerformance[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [metricsRes, trendsRes, jobsRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/analytics/trends?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/analytics/job-performance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMetrics(metricsRes.data);
      setTrends(trendsRes.data || []);
      setJobPerformance(jobsRes.data || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserPortalShell
      eyebrow="Analytics & insights"
      title="Track recruitment metrics and trends."
      description="Monitor application flow, conversion rates, and job performance across your pipeline."
      stats={
        metrics
          ? [
              { label: "Total applications", value: `${metrics.total_applications}` },
              { label: "Pending review", value: `${metrics.pending_applications}` },
              { label: "Approved", value: `${metrics.approved_applications}` },
              { label: "Hired", value: `${metrics.hired_count}` },
            ]
          : []
      }
    >
      <div className="rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {(["overview", "trends", "jobs"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 border-b-2 px-4 py-4 text-center font-bold transition ${
                activeTab === tab
                  ? "border-violet-600 bg-white text-violet-700"
                  : "border-transparent text-slate-600 hover:bg-white"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "trends" && "Trends"}
              {tab === "jobs" && "Job Performance"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600" />
            </div>
          ) : activeTab === "overview" && metrics ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={<Users className="text-blue-600" size={24} />}
                label="Total Applications"
                value={metrics.total_applications}
              />
              <MetricCard
                icon={<Calendar className="text-orange-600" size={24} />}
                label="Pending Review"
                value={metrics.pending_applications}
              />
              <MetricCard
                icon={<CheckCircle2 className="text-emerald-600" size={24} />}
                label="Approved"
                value={metrics.approved_applications}
              />
              <MetricCard
                icon={<TrendingUp className="text-violet-600" size={24} />}
                label="Hired"
                value={metrics.hired_count}
              />
            </div>
          ) : activeTab === "trends" ? (
            <div className="space-y-5">
              <div className="flex gap-2">
                {(["week", "month", "year"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                      timeRange === range
                        ? "bg-violet-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-3 text-sm font-bold text-slate-600">
                    Trend Chart - {trends.length} data points
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {trends.map((t) => `${t.date}: ${t.applications} apps`).join(" | ")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Job Title</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Applications</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Approved</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Hired</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {jobPerformance.map((job) => (
                      <tr key={job.job_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{job.job_title}</td>
                        <td className="px-4 py-3 text-slate-600">{job.total_applications}</td>
                        <td className="px-4 py-3 text-slate-600">{job.approved}</td>
                        <td className="px-4 py-3 text-slate-600">{job.hired}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                            {Math.round(job.conversion_rate * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserPortalShell>
  );
};

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
