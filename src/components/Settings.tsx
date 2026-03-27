import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { db, doc, getDoc, updateDoc, auth } from "../firebase";
import { Settings as SettingsIcon, Palette, Globe, Shield, Code, Copy, Check, Zap, BookOpen, Slack, Phone, Mail, MessageCircle, Facebook, Instagram, Twitter } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("widget");
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const docRef = doc(db, "workspaces", "default");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setWorkspace(docSnap.data());
      } else {
        const newWorkspace = {
          id: "default",
          name: "My Website",
          ownerId: auth.currentUser?.uid,
          apiKey: "ak_" + Math.random().toString(36).substring(2, 15),
          widgetConfig: {
            primaryColor: "#000000",
            welcomeMessage: "Hello! How can we help you today?",
            logoUrl: "",
            position: "right",
            borderRadius: "24px",
            widgetSize: "medium",
            headerGradient: true,
            fontFamily: "Inter",
          },
          aiEnabled: false,
          plan: "free",
        };
        await updateDoc(docRef, newWorkspace);
        setWorkspace(newWorkspace);
      }
      setLoading(false);
    };
    fetchWorkspace();
  }, []);

  const handleUpdate = async (updates: any) => {
    const docRef = doc(db, "workspaces", "default");
    await updateDoc(docRef, updates);
    setWorkspace({ ...workspace, ...updates });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  const tabs = [
    { id: "widget", label: t("settings.widget_custom"), icon: Palette },
    { id: "ai", label: t("settings.ai_reply"), icon: Zap },
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "integrations", label: t("settings.integrations"), icon: Globe },
    { id: "api", label: t("settings.api_embed"), icon: Code },
    { id: "account", label: t("settings.account"), icon: Shield },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{t("settings.title")}</h1>
        <p className="text-neutral-500">{t("settings.subtitle")}</p>
      </header>

      <div className="flex gap-12">
        {/* Sidebar Tabs */}
        <aside className="w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-black text-white shadow-lg" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "widget" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6">{t("settings.widget_custom")}</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">{t("settings.primary_color")}</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={workspace.widgetConfig.primaryColor}
                        onChange={(e) => handleUpdate({ widgetConfig: { ...workspace.widgetConfig, primaryColor: e.target.value } })}
                        className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden"
                      />
                      <span className="text-sm font-mono text-neutral-500">{workspace.widgetConfig.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">Position</label>
                    <div className="flex gap-4">
                      {["left", "right"].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => handleUpdate({ widgetConfig: { ...workspace.widgetConfig, position: pos } })}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                            workspace.widgetConfig.position === pos ? "bg-black text-white border-black" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          {pos.charAt(0).toUpperCase() + pos.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">Border Radius</label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={parseInt(workspace.widgetConfig.borderRadius || "24")}
                      onChange={(e) => handleUpdate({ widgetConfig: { ...workspace.widgetConfig, borderRadius: `${e.target.value}px` } })}
                      className="w-full accent-black"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 font-bold mt-1">
                      <span>SQUARE</span>
                      <span>{workspace.widgetConfig.borderRadius}</span>
                      <span>ROUNDED</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">Font Family</label>
                    <select
                      value={workspace.widgetConfig.fontFamily || "Inter"}
                      onChange={(e) => handleUpdate({ widgetConfig: { ...workspace.widgetConfig, fontFamily: e.target.value } })}
                      className="w-full px-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
                    >
                      <option value="Inter">Inter (Default)</option>
                      <option value="'Space Grotesk'">Space Grotesk (Modern)</option>
                      <option value="'Playfair Display'">Playfair Display (Elegant)</option>
                      <option value="'JetBrains Mono'">JetBrains Mono (Technical)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Header Gradient</p>
                      <p className="text-xs text-neutral-500">Add a subtle gradient to the chat header</p>
                    </div>
                    <button
                      onClick={() => handleUpdate({ widgetConfig: { ...workspace.widgetConfig, headerGradient: !workspace.widgetConfig.headerGradient } })}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${workspace.widgetConfig.headerGradient ? "bg-black" : "bg-neutral-200"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${workspace.widgetConfig.headerGradient ? "translate-x-6" : "translate-x-0"}`}></div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">{t("settings.welcome_msg")}</label>
                    <textarea
                      value={workspace.widgetConfig.welcomeMessage}
                      onChange={(e) => handleUpdate({ widgetConfig: { ...workspace.widgetConfig, welcomeMessage: e.target.value } })}
                      className="w-full px-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all h-32 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-neutral-100 p-8 rounded-3xl border border-neutral-200 text-center">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">{t("settings.live_preview")}</p>
                <div className="max-w-[300px] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200">
                  <div className="p-4 flex items-center gap-3 bg-black text-white">
                    <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center font-bold">A</div>
                    <div className="text-left">
                      <p className="text-xs font-bold">AnyChat Support</p>
                      <p className="text-[10px] text-neutral-400">Online</p>
                    </div>
                  </div>
                  <div className="p-6 h-48 flex flex-col justify-end">
                    <div className="bg-neutral-100 p-3 rounded-2xl rounded-tl-none text-xs text-left text-neutral-600 max-w-[80%]">
                      {workspace.widgetConfig.welcomeMessage}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "api" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">{t("settings.embed_code")}</h3>
                <p className="text-sm text-neutral-500 mb-6 leading-relaxed">Copy and paste this script tag into the <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code> of your website.</p>
                <div className="relative">
                  <pre className="bg-neutral-900 text-neutral-300 p-6 rounded-2xl text-xs overflow-x-auto font-mono leading-relaxed">
                    {`<script src="${window.location.origin}/widget.js?key=${workspace.apiKey}"></script>`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`<script src="${window.location.origin}/widget.js?key=${workspace.apiKey}"></script>`)}
                    className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Export Project</h3>
                <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                  You can download the entire source code of this project as a ZIP file or export it to GitHub using the <strong>Settings</strong> menu in the AI Studio sidebar (top right).
                </p>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Globe className="w-6 h-6 text-blue-500" />
                  <p className="text-xs text-blue-700 font-medium">
                    This will include all files, including the server, frontend, and configuration.
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">{t("settings.api_key")}</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    readOnly
                    value={workspace.apiKey}
                    className="flex-1 px-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(workspace.apiKey)}
                    className="px-6 py-3 bg-black text-white rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center gap-2"
                  >
                    {copied ? t("settings.copied") : t("settings.copy_key")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold">{t("settings.ai_reply")}</h3>
                    <p className="text-sm text-neutral-500">Automatically respond to customer questions using Gemini AI.</p>
                  </div>
                  <button
                    onClick={() => handleUpdate({ aiEnabled: !workspace.aiEnabled })}
                    className={`w-14 h-8 rounded-full p-1 transition-all ${workspace.aiEnabled ? "bg-black" : "bg-neutral-200"}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all ${workspace.aiEnabled ? "translate-x-6" : "translate-x-0"}`}></div>
                  </button>
                </div>

                {workspace.aiEnabled && (
                  <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-neutral-900">
                      <Zap className="w-5 h-5 text-orange-500" />
                      {t("inbox.ai_active")}
                    </div>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      The AI will use your website context to provide helpful answers. You can customize the AI's knowledge base in the "Knowledge Base" section (coming soon).
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "knowledge" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6">AI Knowledge Base</h3>
                <p className="text-sm text-neutral-500 mb-8">Provide context about your business, products, and services. The AI will use this information to answer customer questions.</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">Business Context</label>
                    <textarea
                      placeholder="e.g. AnyChat is a SaaS platform for multi-channel communication. We support WhatsApp, Telegram, and Messenger. Our pricing starts at $29/month..."
                      value={workspace.knowledgeBaseContext || ""}
                      onChange={(e) => handleUpdate({ knowledgeBaseContext: e.target.value })}
                      rows={10}
                      className="w-full px-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold mb-2">{t("settings.integrations")}</h3>
                <p className="text-sm text-neutral-500 mb-8">Connect AnyChat with your favorite tools and communication channels.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: "slack", name: "Slack", icon: Slack, desc: "Send notifications and reply to chats directly from Slack.", color: "text-[#4A154B]", bg: "bg-[#4A154B]/5" },
                    { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, desc: "Connect your WhatsApp Business account to AnyChat.", color: "text-[#25D366]", bg: "bg-[#25D366]/5" },
                    { id: "sms", name: "SMS (Twilio)", icon: Phone, desc: "Send and receive text messages using Twilio integration.", color: "text-blue-600", bg: "bg-blue-50" },
                    { id: "email", name: "Email", icon: Mail, desc: "Forward chats to your support email and reply via email.", color: "text-red-600", bg: "bg-red-50" },
                    { id: "messenger", name: "Messenger", icon: Facebook, desc: "Connect your Facebook Page to manage Messenger chats.", color: "text-[#0084FF]", bg: "bg-[#0084FF]/5" },
                    { id: "instagram", name: "Instagram", icon: Instagram, desc: "Manage your Instagram Direct Messages from AnyChat.", color: "text-[#E4405F]", bg: "bg-[#E4405F]/5" },
                  ].map((item) => (
                    <div key={item.id} className="p-6 rounded-3xl border border-neutral-100 bg-neutral-50 flex flex-col justify-between group hover:border-neutral-200 transition-all">
                      <div>
                        <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center mb-4`}>
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <h4 className="font-bold text-neutral-900 mb-2">{item.name}</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed mb-6">{item.desc}</p>
                      </div>
                      <button className="w-full py-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold hover:bg-black hover:text-white hover:border-black transition-all">
                        Connect {item.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
