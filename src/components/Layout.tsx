import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth, signOut, db, doc, updateDoc, serverTimestamp } from "../firebase";
import { useEffect } from "react";
import { LayoutDashboard, MessageSquare, Settings, BarChart3, LogOut, User, Globe, Users, Megaphone, Wrench, ShieldCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Activity Tracking
  useEffect(() => {
    if (!auth.currentUser) return;

    const updateActivity = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const now = serverTimestamp();
      
      try {
        // Update global user
        await updateDoc(doc(db, "users", userId), {
          lastActive: now
        });

        // Update workspace member if exists
        await updateDoc(doc(db, "workspaces", "default", "members", userId), {
          lastActive: now,
          status: "active"
        }).catch(() => {});
      } catch (e) {
        // Ignore errors
      }
    };

    updateActivity();
    const interval = setInterval(updateActivity, 1000 * 60 * 5); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: t("nav.dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { name: t("nav.inbox"), path: "/inbox", icon: MessageSquare },
    { name: t("nav.team"), path: "/team", icon: ShieldCheck },
    { name: t("nav.contacts"), path: "/contacts", icon: Users },
    { name: t("nav.campaigns"), path: "/campaigns", icon: Megaphone },
    { name: t("nav.analytics"), path: "/analytics", icon: BarChart3 },
    { name: t("nav.tools"), path: "/tools", icon: Wrench },
    { name: t("nav.settings"), path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">AnyChat</span>
          </Link>
          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
            title={i18n.language === 'en' ? 'العربية' : 'English'}
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-neutral-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{auth.currentUser?.displayName || "User"}</p>
              <p className="text-xs text-neutral-500 truncate">{auth.currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t("nav.sign_out")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
