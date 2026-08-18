import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell.jsx";
import {
  Shield, Users, FileText, Bot, BrainCircuit, ListChecks, Video,
  TrendingUp, Activity, LogOut, BarChart3, Clock, Award, Loader2,
  ChevronRight, User, Zap
} from "lucide-react";
import api from "../api.js";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const MODULE_ICONS = {
  "Resume Analyzer": FileText,
  "Mock Interview": Bot,
  "Technical Quiz": ListChecks,
  "Aptitude Test": BrainCircuit,
  "HR Interview": Users,
  "Video Interview": Video,
};

const MODULE_COLORS = {
  "Resume Analyzer": "primary",
  "Mock Interview": "lavender",
  "Technical Quiz": "mint",
  "Aptitude Test": "amber",
  "HR Interview": "coral",
  "Video Interview": "amber",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token || localStorage.getItem("isAdmin") !== "true") {
      navigate("/admin/login");
      return;
    }

    const headers = { "x-admin-token": token };
    Promise.all([
      api.get("/admin/stats", { headers }),
      api.get("/admin/users", { headers }),
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          navigate("/admin/login");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleLogout() {
    const token = localStorage.getItem("adminToken");
    api.post("/admin/logout", {}, { headers: { "x-admin-token": token } }).catch(() => {});
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userId");
    navigate("/admin/login");
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-lavender text-white flex items-center justify-center shadow-glow">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Admin Dashboard</h1>
            <p className="text-sm text-ink-soft">Monitor platform activity and manage users</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary-soft border border-primary/20 rounded-full px-4 py-2 hover:shadow-soft transition-shadow"
          >
            <Zap size={14} />
            Main Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-coral transition-colors bg-white border border-border rounded-full px-4 py-2 hover:shadow-soft"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-border rounded-full p-1 mb-8 w-fit">
        {[
          { key: "overview", label: "Overview", icon: BarChart3 },
          { key: "users", label: "Users", icon: Users },
          { key: "activity", label: "Activity", icon: Activity },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
              tab === key
                ? "bg-primary text-white shadow-soft"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Stats Cards */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="primary" />
              <StatCard icon={Activity} label="Active Today" value={stats?.activeToday} color="mint" />
              <StatCard icon={Bot} label="Interviews" value={stats?.totalInterviews} color="lavender" />
              <StatCard icon={ListChecks} label="Quizzes" value={stats?.totalQuizzes} color="amber" />
              <StatCard icon={FileText} label="Resumes" value={stats?.totalResumes} color="coral" />
              <StatCard icon={Award} label="Avg Readiness" value={`${stats?.avgReadiness}%`} color="primary" />
            </motion.div>

            {/* Module Usage + Weekly Chart */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Module Usage */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-ink text-base">Module Usage</h2>
                  <span className="text-xs text-ink-faint">Last 7 days</span>
                </div>
                <div className="space-y-3">
                  {stats?.moduleUsage?.map((m) => {
                    const Icon = MODULE_ICONS[m.module] || Activity;
                    const color = MODULE_COLORS[m.module] || "primary";
                    const maxCount = Math.max(...stats.moduleUsage.map((x) => x.count));
                    const pct = Math.round((m.count / maxCount) * 100);
                    return (
                      <div key={m.module} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${color}-soft flex items-center justify-center shrink-0`}>
                          <Icon size={14} className={`text-${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-ink truncate">{m.module}</span>
                            <span className="text-xs text-mint font-semibold">{m.trend}</span>
                          </div>
                          <div className="w-full h-2 bg-paper rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full bg-${color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-ink w-8 text-right">{m.count}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Weekly Activity Chart */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-ink text-base">Weekly Activity</h2>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Users</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-lavender" /> Sessions</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 sm:gap-3 h-44">
                  {stats?.dailyStats?.map((d, i) => {
                    const maxSessions = Math.max(...stats.dailyStats.map((x) => x.sessions));
                    const userH = Math.round((d.users / maxSessions) * 100);
                    const sessH = Math.round((d.sessions / maxSessions) * 100);
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex items-end gap-0.5 w-full h-36">
                          <motion.div
                            className="flex-1 bg-primary rounded-t-md"
                            initial={{ height: 0 }}
                            animate={{ height: `${userH}%` }}
                            transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                          />
                          <motion.div
                            className="flex-1 bg-lavender rounded-t-md"
                            initial={{ height: 0 }}
                            animate={{ height: `${sessH}%` }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-ink-faint">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {tab === "users" && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-ink text-base">Registered Users</h2>
                <span className="text-xs font-semibold text-ink-faint bg-paper border border-border rounded-full px-3 py-1">
                  {users.length} users
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-paper text-xs font-semibold text-ink-faint uppercase tracking-wider">
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3 text-center">Readiness</th>
                      <th className="px-5 py-3 text-center">Sessions</th>
                      <th className="px-5 py-3">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-border/50 hover:bg-primary-soft/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-xs">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink">{u.name}</p>
                              <p className="text-xs text-ink-faint">@{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-ink-soft">{u.email}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            u.readiness >= 80 ? "bg-mint-soft text-mint" :
                            u.readiness >= 60 ? "bg-amber-soft text-amber" :
                            "bg-coral-soft text-coral"
                          }`}>
                            {u.readiness}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-sm font-semibold text-ink">{u.sessions}</td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1 text-xs text-ink-faint">
                            <Clock size={11} />
                            {u.lastActive}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card p-5 sm:p-6">
              <h2 className="font-display font-bold text-ink text-base mb-5">Recent Activity</h2>
              <div className="space-y-3">
                {stats?.recentActivity?.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 bg-paper border border-border/50 rounded-xl p-3.5 hover:shadow-soft transition-shadow"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      <User size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink">
                        <span className="font-semibold">@{a.user}</span>{" "}
                        <span className="text-ink-soft">{a.action}</span>
                      </p>
                      <span className="text-xs text-ink-faint flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {a.time}
                      </span>
                    </div>
                    {a.score !== null && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        a.score >= 80 ? "bg-mint-soft text-mint" :
                        a.score >= 60 ? "bg-amber-soft text-amber" :
                        "bg-coral-soft text-coral"
                      }`}>
                        {a.score}%
                      </span>
                    )}
                    {a.score === null && (
                      <span className="text-xs font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                        <Zap size={10} /> New
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function StatCard({ icon: Icon, label, value, color = "primary" }) {
  return (
    <motion.div variants={fadeUp} className="card p-4 sm:p-5 hover:shadow-card transition-shadow">
      <div className={`w-10 h-10 rounded-xl bg-${color}-soft flex items-center justify-center mb-3`}>
        <Icon size={18} className={`text-${color}`} />
      </div>
      <p className="font-display text-xl sm:text-2xl font-bold text-ink leading-none">{value}</p>
      <p className="text-xs text-ink-soft mt-1.5">{label}</p>
    </motion.div>
  );
}
