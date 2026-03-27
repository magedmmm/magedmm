import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { auth, onSnapshot, doc, db } from "./firebase";
import { useAutoReply } from "./hooks/useAutoReply";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import Inbox from "./components/Inbox";
import Settings from "./components/Settings";
import Analytics from "./components/Analytics";
import Widget from "./components/Widget";
import Pricing from "./components/Pricing";
import Layout from "./components/Layout";
import Contacts from "./components/Contacts";
import Campaigns from "./components/Campaigns";
import Tools from "./components/Tools";
import Team from "./components/Team";

export default function App() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize AI Auto-reply background listener
  useAutoReply(user);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/widget" element={<Widget />} />
        
        <Route
          path="/dashboard"
          element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/" />}
        />
        <Route
          path="/inbox"
          element={user ? <Layout><Inbox /></Layout> : <Navigate to="/" />}
        />
        <Route
          path="/team"
          element={user ? <Layout><Team /></Layout> : <Navigate to="/" />}
        />
        <Route
          path="/settings"
          element={user ? <Layout><Settings /></Layout> : <Navigate to="/" />}
        />
        <Route
          path="/analytics"
          element={user ? <Layout><Analytics /></Layout> : <Navigate to="/" />}
        />
        <Route
          path="/contacts"
          element={user ? <Layout><Contacts /></Layout> : <Navigate to="/" />}
        />
        <Route
          path="/campaigns"
          element={user ? <Layout><Campaigns /></Layout> : <Navigate to="/" />}
        />
        <Route
          path="/tools"
          element={user ? <Layout><Tools /></Layout> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}
