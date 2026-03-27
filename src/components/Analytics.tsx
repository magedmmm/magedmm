import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Users, MessageSquare, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

const data = [
  { name: "Mon", conversations: 40, users: 240, responseTime: 12 },
  { name: "Tue", conversations: 30, users: 139, responseTime: 15 },
  { name: "Wed", conversations: 20, users: 980, responseTime: 10 },
  { name: "Thu", conversations: 27, users: 390, responseTime: 14 },
  { name: "Fri", conversations: 18, users: 480, responseTime: 11 },
  { name: "Sat", conversations: 23, users: 380, responseTime: 13 },
  { name: "Sun", conversations: 34, users: 430, responseTime: 9 },
];

export default function Analytics() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("7d");

  const stats = [
    { label: t("analytics.total_convs"), value: "1,284", trend: "+12.5%", isUp: true, icon: MessageSquare },
    { label: t("analytics.active_customers"), value: "8,432", trend: "+8.2%", isUp: true, icon: Users },
    { label: t("analytics.avg_response"), value: "12m 4s", trend: "-2.1%", isUp: false, icon: Clock },
    { label: t("analytics.satisfaction"), value: "98.4%", trend: "+0.5%", isUp: true, icon: TrendingUp },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{t("analytics.title")}</h1>
          <p className="text-neutral-500">{t("analytics.subtitle")}</p>
        </div>
        <div className="flex bg-neutral-100 p-1 rounded-xl">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                timeRange === range ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-neutral-900" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Conversations Chart */}
        <div className="bg-white p-8 rounded-[40px] border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">{t("analytics.conv_volume")}</h3>
            <div className="flex items-center gap-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                Total
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="conversations" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorConv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white p-8 rounded-[40px] border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">{t("analytics.avg_response")} (min)</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip
                  cursor={{ fill: '#f8f8f8' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="responseTime" fill="#000" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="mt-8 bg-white p-8 rounded-[40px] border border-neutral-200 shadow-sm">
        <h3 className="text-lg font-bold mb-8">{t("analytics.channel_breakdown")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: "Live Chat", value: "45%", color: "bg-blue-500" },
            { label: "WhatsApp", value: "30%", color: "bg-green-500" },
            { label: "Telegram", value: "15%", color: "bg-sky-500" },
            { label: "Messenger", value: "10%", color: "bg-indigo-500" },
          ].map((channel, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>{channel.label}</span>
                <span className="text-neutral-400">{channel.value}</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full ${channel.color}`} style={{ width: channel.value }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
