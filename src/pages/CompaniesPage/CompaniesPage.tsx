import React, { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";
import { getLogoUrl } from "../../utils/logoUtils";

interface Company {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo: string | null;
  verified_status: "verified" | "unverified";
  created_at?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const truncate = (value: string | null, fallback: string, max = 120) => {
  if (!value || !value.trim()) return fallback;
  return value.length > max ? `${value.slice(0, max).trim()}...` : value;
};

const formatWebsite = (website: string) => {
  try {
    const normalized = website.startsWith("http") ? website : `https://${website}`;
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return website;
  }
};

const getCompanyLink = (website: string) => (website.startsWith("http") ? website : `https://${website}`);

const getLocationLabel = (value: string | null) => value || "Location unavailable";

const getCompanyInitial = (name: string) => name.charAt(0).toUpperCase();

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = companies.filter((company) => {
      if (!query) return true;

      return (
        company.name.toLowerCase().includes(query) ||
        (company.location && company.location.toLowerCase().includes(query)) ||
        (company.description && company.description.toLowerCase().includes(query))
      );
    });

    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  useEffect(() => {
    if (!selectedCompany) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCompany(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/public/companies`);
      setCompanies(response.data);
      setFilteredCompanies(response.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Unable to load companies right now.");
    } finally {
      setLoading(false);
    }
  };

  const verifiedCompanies = companies.filter((company) => company.verified_status === "verified").length;
  const companiesWithWebsites = companies.filter((company) => !!company.website).length;

  return (
    <UserPortalShell
      eyebrow="Employer directory"
      title="Browse employers with stronger company context."
      description="Compare verified companies, review their core details at a glance, and open a focused detail drawer without losing your place in the grid."
      stats={[
        { label: "Employers", value: `${companies.length}` },
        { label: "Verified", value: `${verifiedCompanies}` },
        { label: "With websites", value: `${companiesWithWebsites}` },
        { label: "Visible now", value: `${filteredCompanies.length}` },
      ]}
      actions={
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-orange-50 p-5 text-center shadow-[0_18px_60px_-28px_rgba(124,58,237,0.45)] sm:min-w-80">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">Use the drawer for faster review</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Open a company to inspect contact info, website, and summary while keeping the grid in context.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur xl:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-600">Find companies</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Search by employer, location, or company background
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Each company card is structured to surface the essentials quickly, then expand into a full contextual profile on demand.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <PillStat label="Verified ratio" value={companies.length ? `${Math.round((verifiedCompanies / companies.length) * 100)}%` : "0%"} />
            <PillStat label="Open in drawer" value={selectedCompany ? "1 active" : "None"} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, cities, or keywords"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={fetchCompanies}
              className="rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Company directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredCompanies.length} compan{filteredCompanies.length === 1 ? "y" : "ies"} in view.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
              {companies.filter((company) => !!company.contact_email).length} with email contact
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
              {companies.filter((company) => !!company.contact_phone).length} with phone contact
            </span>
          </div>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((card) => (
              <div key={card} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-16 w-16 animate-pulse rounded-3xl bg-slate-100" />
                <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="mt-6 h-20 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-bold text-red-700">Unable to load companies</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchCompanies}
              className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredCompanies.length === 0 && (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
              <Building2 size={28} />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-900">No companies match this search</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try a broader company name, location, or keyword to surface more employers.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Clear search
            </button>
          </div>
        )}

        {!loading && !error && filteredCompanies.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCompanies.map((company) => {
              const isActive = selectedCompany?.id === company.id;

              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => setSelectedCompany(company)}
                  className={`group rounded-[1.9rem] border bg-white p-6 text-left shadow-[0_20px_60px_-36px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-34px_rgba(124,58,237,0.28)] ${isActive ? "border-violet-300 ring-4 ring-violet-500/10" : "border-slate-200 hover:border-violet-200"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-orange-50 text-xl font-black text-violet-700">
                        {company.logo ? (
                          <img
                            src={getLogoUrl(company.logo)}
                            alt={`${company.name} logo`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getCompanyInitial(company.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${company.verified_status === "verified"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                            }`}>
                            {company.verified_status === "verified" ? "Verified employer" : "Unverified"}
                          </span>
                          {company.website && (
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
                              Website available
                            </span>
                          )}
                        </div>
                        <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950 transition group-hover:text-violet-700">
                          {company.name}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <MapPin size={15} />
                          {getLocationLabel(company.location)}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600" size={20} />
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-600">
                    {truncate(company.description, "No company description is available yet.", 160)}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {company.contact_email && (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        Email contact
                      </span>
                    )}
                    {company.contact_phone && (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        Phone contact
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div
        className={`fixed inset-0 z-[90] bg-slate-950/35 backdrop-blur-sm transition ${selectedCompany ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setSelectedCompany(null)}
      />

      <aside
        className={`fixed right-0 top-0 z-[100] h-full w-full max-w-2xl border-l border-white/30 bg-white shadow-2xl transition-transform duration-500 ${selectedCompany ? "translate-x-0" : "translate-x-full"
          }`}
        aria-hidden={!selectedCompany}
      >
        {selectedCompany && (
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),rgba(249,115,22,0.08))] px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/60 bg-white text-xl font-black text-violet-700 shadow-sm">
                    {selectedCompany.logo ? (
                      <img
                        src={getLogoUrl(selectedCompany.logo)}
                        alt={`${selectedCompany.name} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getCompanyInitial(selectedCompany.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${selectedCompany.verified_status === "verified"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-white text-slate-600"
                        }`}>
                        {selectedCompany.verified_status === "verified" ? "Verified employer" : "Employer profile"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                      {selectedCompany.name}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <MapPin size={15} />
                      {getLocationLabel(selectedCompany.location)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCompany(null)}
                  className="rounded-2xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                  aria-label="Close company details"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
              <div className="grid gap-3 sm:grid-cols-2">
                <DrawerInfoCard
                  icon={<ShieldCheck size={16} />}
                  label="Verification"
                  value={selectedCompany.verified_status === "verified" ? "Verified by platform" : "Awaiting verification"}
                />
                <DrawerInfoCard
                  icon={<Globe size={16} />}
                  label="Website"
                  value={selectedCompany.website ? formatWebsite(selectedCompany.website) : "No website provided"}
                />
              </div>

              <section className="mt-8">
                <SectionHeading title="About the company" icon={<Building2 size={18} />} />
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {selectedCompany.description || "No company description is available yet."}
                </p>
              </section>

              <section className="mt-8">
                <SectionHeading title="Contact details" icon={<CheckCircle2 size={18} />} />
                <div className="mt-4 space-y-3">
                  <ContactCard icon={<Mail size={18} />} label="Email" value={selectedCompany.contact_email || "Not provided"} />
                  <ContactCard icon={<Phone size={18} />} label="Phone" value={selectedCompany.contact_phone || "Not provided"} />
                  <ContactCard icon={<MapPin size={18} />} label="Location" value={getLocationLabel(selectedCompany.location)} />
                </div>
              </section>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
              {selectedCompany.website ? (
                <a
                  href={getCompanyLink(selectedCompany.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  Visit website
                  <ArrowRight size={16} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedCompany(null)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </UserPortalShell>
  );
};

function PillStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm sm:min-w-28">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
    </div>
  );
}

function SectionHeading({ title, icon }: { title: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-slate-950">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        {icon}
      </div>
      <h4 className="text-lg font-black tracking-tight">{title}</h4>
    </div>
  );
}

function DrawerInfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default CompaniesPage;
