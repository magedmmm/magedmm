import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Plus, Search, MoreVertical, Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const campaigns = [
  { id: 1, name: "Ramadan Offer 2026", channel: "WhatsApp", sent: 1200, opened: 850, status: "Sent", date: "2026-03-20" },
  { id: 2, name: "New Feature Announcement", channel: "Telegram", sent: 500, opened: 320, status: "Sent", date: "2026-03-15" },
  { id: 3, name: "Weekend Flash Sale", channel: "WhatsApp", sent: 0, opened: 0, status: "Draft", date: "2026-03-25" },
  { id: 4, name: "Customer Feedback Survey", channel: "Messenger", sent: 800, opened: 450, status: "Scheduled", date: "2026-03-30" },
];

export default function Campaigns() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{t("nav.campaigns")}</h1>
          <p className="text-neutral-500">Broadcast messages and manage your marketing campaigns.</p>
        </div>
        <button className="bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </header>

      <div className="bg-white rounded-[40px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-xs font-bold text-neutral-400 uppercase tracking-widest">
              <th className="px-8 py-4">Campaign Name</th>
              <th className="px-8 py-4">Channel</th>
              <th className="px-8 py-4">Stats</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {campaigns.map((campaign, i) => (
              <motion.tr
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-neutral-50 transition-colors group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-neutral-900" />
                    </div>
                    <span className="font-bold text-neutral-900">{campaign.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-medium text-neutral-600">{campaign.channel}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                      <Send className="w-3 h-3" />
                      {campaign.sent} Sent
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {campaign.opened} Opened
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit ${
                    campaign.status === 'Sent' ? 'bg-green-50 text-green-600' : 
                    campaign.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 
                    campaign.status === 'Draft' ? 'bg-neutral-100 text-neutral-400' : 'bg-red-50 text-red-600'
                  }`}>
                    {campaign.status === 'Sent' && <CheckCircle2 className="w-3 h-3" />}
                    {campaign.status === 'Scheduled' && <Clock className="w-3 h-3" />}
                    {campaign.status === 'Draft' && <AlertCircle className="w-3 h-3" />}
                    {campaign.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm text-neutral-500">{campaign.date}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-400">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
