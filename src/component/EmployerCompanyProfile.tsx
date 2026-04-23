import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  Globe,
  Mail,
  MapPin,
  Phone,
  Upload,
  X,
} from "lucide-react";
import { getLogoUrl } from "../utils/logoUtils";

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
}

interface FormData {
  name: string;
  description: string;
  location: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  logo: File | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EmployerCompanyProfile: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    location: "",
    website: "",
    contact_email: "",
    contact_phone: "",
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    if (!token || !user?.company_id) {
      setError("Unauthorized access");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/company/${user.company_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const companyData = response.data;
      setCompany(companyData);
      setFormData({
        name: companyData.name,
        description: companyData.description || "",
        location: companyData.location || "",
        website: companyData.website || "",
        contact_email: companyData.contact_email || "",
        contact_phone: companyData.contact_phone || "",
        logo: null,
      });

      if (companyData.logo) {
        setLogoPreview(getLogoUrl(companyData.logo));
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError("Failed to load company profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !company) {
      setError("Authentication required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("website", formData.website);
      data.append("contact_email", formData.contact_email);
      data.append("contact_phone", formData.contact_phone);

      if (formData.logo) {
        data.append("logo", formData.logo);
      }

      await axios.put(
        `${API_URL}/api/company/${company.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSuccess(true);
      fetchCompanyProfile();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving company profile:", err);
      setError("Failed to save company profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600" />
          <p className="text-slate-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2.5rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur">
          {/* Header */}
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),rgba(249,115,22,0.08))] px-6 py-8 sm:px-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Company Profile
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Update your company information, logo, and contact details here.
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8 sm:px-8">
            {error && (
              <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-bold text-red-800">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="h-5 w-5 shrink-0 rounded-full border-2 border-emerald-600" />
                <p className="text-sm font-bold text-emerald-800">
                  Company profile updated successfully!
                </p>
              </div>
            )}

            {/* Logo Upload */}
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <label className="block text-sm font-bold uppercase tracking-wide text-slate-400">
                <Upload className="mb-2 inline h-4 w-4" /> Company Logo
              </label>
              <p className="mt-1 text-sm text-slate-500">
                Upload a square image (recommended 500x500px or larger)
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                {logoPreview && (
                  <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-2 border-violet-200 bg-white shadow-sm">
                    <img
                      src={logoPreview}
                      alt="Company logo preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        setFormData((prev) => ({
                          ...prev,
                          logo: null,
                        }));
                      }}
                      className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white transition hover:bg-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <label className="relative flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-violet-400 hover:bg-violet-50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div>
                    <Upload className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      Click to upload
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-slate-400">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-slate-400">
                Company Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                placeholder="Tell job seekers about your company..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
                <MapPin size={14} /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                placeholder="City, State"
              />
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
                <Globe size={14} /> Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                placeholder="https://example.com"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
                <Mail size={14} /> Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                placeholder="contact@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
                <Phone size={14} /> Contact Phone
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 border-t border-slate-200 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-2xl bg-violet-600 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => fetchCompanyProfile()}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployerCompanyProfile;
