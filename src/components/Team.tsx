import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { db, collection, onSnapshot, query, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from "../firebase";
import { UserPlus, MoreVertical, Shield, User, Mail, Clock, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  role: "admin" | "agent";
  status: "active" | "invited" | "inactive";
  invitedAt: any;
  lastActive: any;
}

export default function Team() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "agent">("agent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "workspaces", "default", "members"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
      setMembers(membersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      await addDoc(collection(db, "workspaces", "default", "members"), {
        email: inviteEmail,
        role: inviteRole,
        status: "invited",
        invitedAt: serverTimestamp(),
        lastActive: null,
        displayName: inviteEmail.split("@")[0],
        userId: "pending_" + Math.random().toString(36).substring(2, 9)
      });
      setInviteEmail("");
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const updateRole = async (memberId: string, newRole: "admin" | "agent") => {
    try {
      await updateDoc(doc(db, "workspaces", "default", "members", memberId), {
        role: newRole
      });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    try {
      await deleteDoc(doc(db, "workspaces", "default", "members", memberId));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Never";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{t("nav.team")}</h1>
          <p className="text-neutral-500">Manage your team members, roles, and track their activity.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Invite Member
        </button>
      </header>

      <div className="bg-white rounded-[40px] border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-xs font-bold text-neutral-400 uppercase tracking-widest">
              <th className="px-8 py-4">Member</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Last Active</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-neutral-400">Loading team members...</td>
              </tr>
            ) : members.length > 0 ? (
              members.map((member, i) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-neutral-50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-600">
                        {member.displayName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900">{member.displayName}</p>
                        <p className="text-xs text-neutral-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {member.role === "admin" ? (
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                      ) : (
                        <User className="w-4 h-4 text-neutral-400" />
                      )}
                      <select 
                        value={member.role}
                        onChange={(e) => updateRole(member.id, e.target.value as any)}
                        className="bg-transparent border-none text-sm font-medium text-neutral-600 focus:ring-0 cursor-pointer hover:text-neutral-900"
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      member.status === 'active' ? 'bg-green-50 text-green-600' : 
                      member.status === 'invited' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Clock className="w-4 h-4" />
                      {formatDate(member.lastActive)}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => removeMember(member.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-neutral-400">No team members found. Invite someone!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setInviteRole("agent")}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      inviteRole === "agent" ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"
                    }`}
                  >
                    <User className={`w-6 h-6 mb-2 ${inviteRole === "agent" ? "text-black" : "text-neutral-400"}`} />
                    <p className="font-bold text-sm">Agent</p>
                    <p className="text-xs text-neutral-500">Can manage chats</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteRole("admin")}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      inviteRole === "admin" ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"
                    }`}
                  >
                    <ShieldCheck className={`w-6 h-6 mb-2 ${inviteRole === "admin" ? "text-black" : "text-neutral-400"}`} />
                    <p className="font-bold text-sm">Admin</p>
                    <p className="text-xs text-neutral-500">Full access to settings</p>
                  </button>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-neutral-500 hover:bg-neutral-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
