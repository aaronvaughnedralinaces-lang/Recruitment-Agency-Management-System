import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
  Archive,
  X,
} from "lucide-react";
import UserPortalShell from "../../component/UserPortalShell";

interface Notification {
  id: number;
  user_id: number;
  type: "application" | "interview" | "message" | "system";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    if (!token) return;

    try {
      await axios.patch(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const filtered = notifications.filter((n) => (filter === "unread" ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <UserPortalShell
      eyebrow="Notification center"
      title="Stay updated on applications and interviews."
      description="View all notifications in one place, mark as read, and manage your notification preferences."
      stats={[
        { label: "Total notifications", value: `${notifications.length}` },
        { label: "Unread", value: `${unreadCount}` },
        { label: "Applications", value: `${notifications.filter((n) => n.type === "application").length}` },
        { label: "Interviews", value: `${notifications.filter((n) => n.type === "interview").length}` },
      ]}
    >
      <div className="rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.3)] backdrop-blur overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Notifications</h2>
            <p className="mt-1 text-sm text-slate-600">
              {filtered.length} notification{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                filter === "all"
                  ? "bg-violet-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                filter === "unread"
                  ? "bg-violet-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Unread {unreadCount > 0 && <span className="ml-2 text-xs">({unreadCount})</span>}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm font-bold text-slate-700">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </UserPortalShell>
  );
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case "application":
        return <Mail size={18} className="text-blue-600" />;
      case "interview":
        return <CheckCircle2 size={18} className="text-emerald-600" />;
      case "message":
        return <AlertCircle size={18} className="text-orange-600" />;
      default:
        return <Info size={18} className="text-violet-600" />;
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        notification.read
          ? "border-slate-200 bg-white"
          : "border-violet-300 bg-violet-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900">{notification.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
              <p className="mt-2 text-xs text-slate-500">
                {new Date(notification.created_at).toLocaleDateString()} at{" "}
                {new Date(notification.created_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex gap-1 shrink-0">
              {!notification.read && (
                <button
                  type="button"
                  onClick={onMarkAsRead}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-200"
                  title="Mark as read"
                >
                  <Archive size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={onDelete}
                className="rounded-full p-2 text-slate-500 hover:bg-red-100 hover:text-red-600"
                title="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
