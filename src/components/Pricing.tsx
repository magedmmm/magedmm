import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricing.free"),
      price: "$0",
      desc: t("pricing.subtitle"), // Reusing subtitle or similar
      features: ["100 conversations / month", "1 agent", "Live Chat channel", "Basic analytics", "AnyChat branding"],
      cta: t("pricing.get_started"),
      popular: false,
    },
    {
      name: t("pricing.pro"),
      price: "$29",
      desc: t("pricing.subtitle"),
      features: ["Unlimited conversations", "5 agents", "WhatsApp & Telegram", "AI Auto-Reply", "Custom branding", "Priority support"],
      cta: t("pricing.start_trial"),
      popular: true,
    },
    {
      name: t("pricing.business"),
      price: "$99",
      desc: t("pricing.subtitle"),
      features: ["Unlimited agents", "All integrations", "Advanced AI training", "Dedicated account manager", "SLA guarantee", "Custom contracts"],
      cta: t("pricing.contact_sales"),
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-32">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between bg-white border-b border-neutral-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold tracking-tight">AnyChat</span>
        </Link>
        <Link to="/" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">{t("nav.dashboard")}</Link>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">{t("pricing.title")}</h1>
        <p className="max-w-xl mx-auto text-xl text-neutral-500 mb-20">{t("pricing.subtitle")}</p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white p-10 rounded-[40px] border border-neutral-200 text-left relative flex flex-col ${plan.popular ? 'shadow-2xl ring-2 ring-black' : 'shadow-sm'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-black text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{plan.desc}</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-neutral-400 font-medium ml-2">{t("pricing.per_month")}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-neutral-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${plan.popular ? 'bg-black text-white hover:bg-neutral-800' : 'bg-neutral-100 text-black hover:bg-neutral-200'}`}>
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="max-w-3xl mx-auto px-6 mt-32 text-center">
        <h2 className="text-3xl font-bold mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6 text-left">
          {[
            { q: "Can I change my plan later?", a: "Yes, you can upgrade or downgrade your plan at any time from your dashboard settings." },
            { q: "Do you offer a free trial?", a: "Yes, all new accounts start with a 14-day free trial of our Pro features." },
            { q: "What channels are supported?", a: "We currently support Live Chat, WhatsApp, Telegram, and Facebook Messenger." },
          ].map((faq, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-neutral-200">
              <h4 className="font-bold mb-3">{faq.q}</h4>
              <p className="text-neutral-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
