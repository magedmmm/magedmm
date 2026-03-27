import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, UserPlus, MoreVertical, Mail, Phone, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const contacts = [
  { id: 1, name: "Ahmed Ali", email: "ahmed@example.com", phone: "+966 50 123 4567", source: "WhatsApp", status: "Active" },
  { id: 2, name: "Sarah Smith", email: "sarah@example.com", phone: "+1 234 567 890", source: "Live Chat", status: "Lead" },
  { id: 3, name: "Mohamed Hassan", email: "mohamed@example.com", phone: "+20 100 123 4567", source: "Telegram", status: "Active" },
  { id: 4, name: "John Doe", email: "john@example.com", phone: "+44 7700 900000", source: "Messenger", status: "Inactive" },
];

export default function Contacts() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{t("nav.contacts")}</h1>
          <p className="text-neutral-500">Manage your customers and leads from all channels.</p>
        </div>
        <button className="bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add Contact
        </button>
      </header>

      <div className="bg-white rounded-[40px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-xs font-bold text-neutral-400 uppercase tracking-widest">
              <th className="px-8 py-4">Name</th>
              <th className="px-8 py-4">Contact Info</th>
              <th className="px-8 py-4">Source</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {contacts.map((contact, i) => (
              <motion.tr
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-neutral-50 transition-colors group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-600">
                      {contact.name[0]}
                    </div>
                    <span className="font-bold text-neutral-900">{contact.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                    <MessageSquare className="w-4 h-4" />
                    {contact.source}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    contact.status === 'Active' ? 'bg-green-50 text-green-600' : 
                    contact.status === 'Lead' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {contact.status}
                  </span>
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
