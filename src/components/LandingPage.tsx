import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth, googleProvider, facebookProvider, signInWithPopup } from "../firebase";
import { MessageSquare, Zap, Globe, Shield, ArrowRight, CheckCircle2, BarChart3, Facebook } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing in with Facebook:", error);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">A</div>
          <span className="text-2xl font-bold tracking-tight">AnyChat</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
          <a href="#features" className="hover:text-black transition-colors">{t("nav.features")}</a>
          <Link to="/pricing" className="hover:text-black transition-colors">{t("nav.pricing")}</Link>
          <a href="#blog" className="hover:text-black transition-colors">{t("nav.blog")}</a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">{i18n.language}</span>
          </button>
          <button onClick={handleGoogleSignIn} className="text-sm font-medium hover:text-black transition-colors">{t("nav.login")}</button>
          <button onClick={handleGoogleSignIn} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all">{t("nav.get_started")}</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
            {t("hero.title")}
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-neutral-500 mb-12">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group"
            >
              {t("hero.cta_free")}
              <ArrowRight className={cn("w-5 h-5 transition-transform", i18n.language === 'ar' ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
            </button>
            <button
              onClick={handleFacebookSignIn}
              className="w-full sm:w-auto bg-[#1877F2] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Facebook className="w-5 h-5" />
              Facebook
            </button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-24 relative"
        >
          <div className="bg-neutral-100 rounded-3xl p-4 shadow-2xl border border-neutral-200 overflow-hidden">
            <img
              src="https://picsum.photos/seed/dashboard/1200/800"
              alt="AnyChat Dashboard"
              className="rounded-2xl w-full h-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Floating elements */}
          <div className="absolute -top-12 -left-12 bg-white p-6 rounded-2xl shadow-xl border border-neutral-100 hidden lg:block">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">New Message</p>
                <p className="text-xs text-neutral-500">From WhatsApp</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600">"Hey, I need help with my order..."</p>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-neutral-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">{t("landing.features_title")}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">Powerful features designed for modern customer communication.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t("landing.feature_chat_title"), desc: t("landing.feature_chat_desc"), icon: Globe },
              { title: t("landing.feature_ai_title"), desc: t("landing.feature_ai_desc"), icon: Zap },
              { title: "Real-time Analytics", desc: "Track response times, satisfaction, and conversion rates.", icon: BarChart3 },
              { title: "Team Collaboration", desc: "Assign chats to agents and leave internal notes for your team.", icon: Shield },
              { title: "Custom Widget", desc: "Design a chat widget that matches your brand perfectly.", icon: MessageSquare },
              { title: t("landing.feature_multi_title"), desc: t("landing.feature_multi_desc"), icon: Globe },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-12">Trusted by 2,000+ companies</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
            <span className="text-2xl font-bold">Stripe</span>
            <span className="text-2xl font-bold">Airbnb</span>
            <span className="text-2xl font-bold">Shopify</span>
            <span className="text-2xl font-bold">Slack</span>
            <span className="text-2xl font-bold">Framer</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="bg-black rounded-[40px] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">{t("landing.cta_title")}</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGoogleSignIn}
                className="bg-white text-black px-10 py-5 rounded-full text-xl font-bold hover:bg-neutral-100 transition-all"
              >
                {t("landing.cta_button")}
              </button>
              <button
                onClick={handleFacebookSignIn}
                className="bg-[#1877F2] text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Facebook className="w-6 h-6" />
                Facebook
              </button>
            </div>
            <p className="mt-6 text-neutral-400">No credit card required. 14-day free trial of Pro features.</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-800 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-neutral-800 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold tracking-tight">AnyChat</span>
            </div>
            <p className="text-neutral-500 max-w-xs">The ultimate customer communication platform for modern businesses.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-neutral-500">
              <li><a href="#" className="hover:text-black">Features</a></li>
              <li><Link to="/pricing" className="hover:text-black">Pricing</Link></li>
              <li><a href="#" className="hover:text-black">Widget Builder</a></li>
              <li><a href="#" className="hover:text-black">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-neutral-500">
              <li><a href="#" className="hover:text-black">About</a></li>
              <li><a href="#" className="hover:text-black">Blog</a></li>
              <li><a href="#" className="hover:text-black">Careers</a></li>
              <li><a href="#" className="hover:text-black">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-400">
          <p>© 2026 AnyChat SaaS. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
