import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { auth, db, collection, query, where, onSnapshot, orderBy } from "../firebase";
import { MessageSquare, Users, Zap, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeUsers: 0,
    avgResponseTime: "12m",
    conversionRate: "4.2%",
  });

  const [recentConversations, setRecentConversations] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "workspaces", "default", "conversations"),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentConversations(convs.slice(0, 5));
      setStats(prev => ({ ...prev, totalConversations: convs.length }));
    });

    return () => unsubscribe();
  }, []);

  const statCards = [
    { label: t("dashboard.total_convs"), value: stats.totalConversations, icon: MessageSquare, trend: "+12.5%", color: "bg-blue-500" },
    { label: t("dashboard.active_customers"), value: "1,284", icon: Users, trend: "+8.2%", color: "bg-green-500" },
    { label: t("dashboard.avg_response"), value: stats.avgResponseTime, icon: Clock, trend: "-2.1%", color: "bg-orange-500" },
    { label: t("dashboard.conv_rate"), value: stats.conversionRate, icon: Zap, trend: "+0.5%", color: "bg-purple-500" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{t("dashboard.welcome")}, {auth.currentUser?.displayName?.split(" ")[0]}!</h1>
        <p className="text-neutral-500">{t("dashboard.subtitle")}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-neutral-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">{t("dashboard.recent_convs")}</h2>
            <button className="text-sm font-medium text-primary hover:underline">{t("dashboard.view_all")}</button>
          </div>
          <div className="divide-y divide-neutral-50">
            {recentConversations.length > 0 ? (
              recentConversations.map((conv) => (
                <div key={conv.id} className="p-6 flex items-center gap-4 hover:bg-neutral-50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 font-bold">
                    {conv.customerName?.[0] || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-neutral-900 truncate">{conv.customerName || "Anonymous Customer"}</p>
                      <span className="text-xs text-neutral-400">{new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-neutral-500 truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${conv.status === 'open' ? 'bg-green-500' : 'bg-neutral-300'}`}></span>
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{conv.channel}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-neutral-300" />
                </div>
                <p className="text-neutral-500">{t("inbox.no_convs")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          <div className="bg-black rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">{t("dashboard.upgrade_pro")}</h3>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">{t("dashboard.upgrade_desc")}</p>
              <button className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-neutral-100 transition-all flex items-center justify-center gap-2">
                {t("dashboard.upgrade_btn")}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">{t("dashboard.setup_checklist")}</h3>
            <div className="space-y-4">
              {[
                { label: "Connect your website", done: true },
                { label: "Customize chat widget", done: true },
                { label: "Invite team members", done: false },
                { label: "Setup AI auto-reply", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-100 text-green-600' : 'border-2 border-neutral-100'}`}>
                    {item.done && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-neutral-400 line-through' : 'text-neutral-700 font-medium'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
