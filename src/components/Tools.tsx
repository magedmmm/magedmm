import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Wrench, MessageSquare, QrCode, Link as LinkIcon, Copy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Tools() {
  const { t } = useTranslation();
  const [waNumber, setWaNumber] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const generateWaLink = () => {
    const baseUrl = "https://wa.me/";
    const cleanNumber = waNumber.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(waMessage);
    const url = `${baseUrl}${cleanNumber}${waMessage ? `?text=${encodedMessage}` : ""}`;
    setGeneratedUrl(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    {
      id: "wa-link",
      title: "WhatsApp Link Generator",
      description: "Create a direct link to your WhatsApp with a custom message.",
      icon: MessageSquare,
      color: "bg-green-50 text-green-600",
    },
    {
      id: "qr-code",
      title: "QR Code Generator",
      description: "Generate QR codes for your links and business info.",
      icon: QrCode,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "short-link",
      title: "Short Link Generator",
      description: "Shorten your long URLs for easier sharing.",
      icon: LinkIcon,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{t("nav.tools")}</h1>
        <p className="text-neutral-500">Useful utilities for your customer communication and marketing.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-neutral-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${tool.color}`}>
              <tool.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">{tool.title}</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">{tool.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-neutral-200 shadow-sm p-8 md:p-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-green-600" />
          WhatsApp Link Generator
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">WhatsApp Number</label>
              <input
                type="text"
                placeholder="e.g. 966501234567"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all"
              />
              <p className="mt-2 text-xs text-neutral-400">Include country code without + or 00.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-widest">Welcome Message (Optional)</label>
              <textarea
                placeholder="Hello! I'm interested in your services..."
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-neutral-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black transition-all resize-none"
              />
            </div>
            <button
              onClick={generateWaLink}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all"
            >
              Generate Link
            </button>
          </div>

          <div className="bg-neutral-50 rounded-[32px] p-8 flex flex-col justify-center items-center text-center">
            {generatedUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 mb-6 break-all text-sm font-mono text-neutral-600">
                  {generatedUrl}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 bg-white border border-neutral-200 text-neutral-900 py-3 rounded-xl font-bold hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    Test Link
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="text-neutral-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Fill in the details to generate your link.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
