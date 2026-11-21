import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Bill from "./App.jsx";
import CRM from "./CRM.jsx";
import HRMS from "./HRMS.jsx";
import Site from "./Site.jsx";
import Shop from "./Shop.jsx";
import Dine from "./Dine.jsx";
import Cars from "./Cars.jsx";
import Estate from "./Estate.jsx";
import Messages from "./Messages.jsx";
import Proposal from "./Proposal.jsx";
import { OWNER } from "./config";
import { getShare } from "./extras.jsx";
import "./index.css";

const q = new URLSearchParams(location.search);
const parts = location.pathname.split("/").filter(Boolean);
const first = parts[0];
const direct = [
  "bill",
  "crm",
  "hrms",
  "site",
  "shop",
  "dine",
  "cars",
  "estate",
  "msg",
  "proposal",
].includes(first)
  ? first
  : q.get("app") ||
    (q.has("d") ? "site" : q.has("company") || q.has("s") ? "bill" : "menu");

function Center({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07090e] p-6 text-center text-white selection:bg-amber-500 selection:text-black">
      <div>{children}</div>
    </div>
  );
}

const GOLD = "#e5b869";

function Menu() {
  const [filter, setFilter] = useState("all"); // all | enterprise | commerce | showcase
  const wa = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(OWNER.message)}`;

  const apps = [
    {
      id: "crm",
      href: "/crm",
      icon: "💼",
      badge: "Enterprise Suite",
      badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      title: "CRM Lead Pipeline & Sales",
      category: "enterprise",
      highlight: "₹1.8 Cr+ Pipeline Demo",
      description:
        "Visual Kanban deal tracker, stage-by-stage conversion funnel, client touchpoint logging, and instant 1-click WhatsApp follow-ups.",
      features: [
        "Kanban Deal Stages",
        "Client Activity Logs",
        "Conversion Funnel Analytics",
        "Instant WhatsApp Messaging",
      ],
    },
    {
      id: "hrms",
      href: "/hrms",
      icon: "👥",
      badge: "Workforce & Payroll",
      badgeColor: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
      title: "Nexus HRMS & Automated Payroll",
      category: "enterprise",
      highlight: "Live Shift Terminal",
      description:
        "Complete workforce management, live daily attendance shift simulator, leave approval portal, and instant 1-click printable A4 pay slips with PF/PT breakdown.",
      features: [
        "Shift Punch Terminal",
        "Department Roster",
        "Leave Approval Workflow",
        "Printable A4 Pay Slips",
      ],
    },
    {
      id: "bill",
      href: "/bill",
      icon: "🧾",
      badge: "Financial Engine",
      badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      title: "Invoicing, Quotations & Cash Book",
      category: "enterprise",
      highlight: "GST/VAT & Saved Registry",
      description:
        "Full-featured professional billing with saved document records, custom brand letterheads, UPI scan-to-pay QR, cash book ledger, and PDF/Excel export.",
      features: [
        "Saved Invoices Registry",
        "GST / VAT & Tax Rules",
        "UPI Scan-to-Pay QR",
        "Cash Book Statement & Excel",
      ],
    },
    {
      id: "dine",
      href: "/dine",
      icon: "🍽️",
      badge: "Hospitality Tech",
      badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      title: "Restaurant Tabletop QR Ordering",
      category: "commerce",
      highlight: "Live Kitchen Screen",
      description:
        "Guests scan table QR codes to browse the digital menu and place orders. Kitchen terminal receives and advances tickets live without server delays.",
      features: [
        "QR per Table Generator",
        "Live Chef Kitchen Sync",
        "Real-time Order Tracker",
        "Zero Food Commission",
      ],
    },
    {
      id: "shop",
      href: "/shop",
      icon: "🛍️",
      badge: "Direct Retail",
      badgeColor: "border-blue-500/30 bg-blue-500/10 text-blue-300",
      title: "E-Commerce WhatsApp Storefront",
      category: "commerce",
      highlight: "Instant Cart Checkout",
      description:
        "High-converting online store with dynamic product cart, discount sale badges, category filtering, and direct-to-WhatsApp order dispatch.",
      features: [
        "Interactive Cart Drawer",
        "Offer Badges & Discounts",
        "1-Tap WhatsApp Checkout",
        "Customer Delivery Capture",
      ],
    },
    {
      id: "cars",
      href: "/cars",
      icon: "🚗",
      badge: "Automotive Hub",
      badgeColor: "border-orange-500/30 bg-orange-500/10 text-orange-300",
      title: "Prestige Used Car Showroom",
      category: "showcase",
      highlight: "Interactive EMI Calculator",
      description:
        "Digital vehicle inventory with multi-photo galleries, 150-point inspection badges, instant loan EMI calculator, and test drive booking.",
      features: [
        "150-Point Inspection Badges",
        "Real-time EMI Calculator",
        "Test Drive Booking Link",
        "Vehicle Trade-in Form",
      ],
    },
    {
      id: "estate",
      href: "/estate",
      icon: "🏡",
      badge: "Luxury Living",
      badgeColor: "border-teal-500/30 bg-teal-500/10 text-teal-300",
      title: "Elite Real Estate Portal",
      category: "showcase",
      highlight: "VIP Site Visit Booking",
      description:
        "Showcase residential & commercial properties with photo sliders, floor specifications, neighborhood maps, and VIP site visit requests.",
      features: [
        "Buy & Rent Listings",
        "Mortgage & EMI Estimator",
        "VIP Site Visit Scheduler",
        "Agent WhatsApp Connect",
      ],
    },
    {
      id: "site",
      href: "/site",
      icon: "🌐",
      badge: "Creative Studio",
      badgeColor: "border-pink-500/30 bg-pink-500/10 text-pink-300",
      title: "Brand Website & Appointment Booking",
      category: "showcase",
      highlight: "High-End Visual Portfolio",
      description:
        "World-class booking website for boutique studios, salons, clinics, and interior decorators with photo showcases, client reviews, and Google Maps.",
      features: [
        "High-Res Photo Gallery",
        "Step-by-Step How It Works",
        "Client Testimonial Strip",
        "Embedded Google Maps",
      ],
    },
    {
      id: "proposal",
      href: "/proposal",
      icon: "💍",
      badge: "Romance Studio",
      badgeColor: "border-rose-500/30 bg-rose-500/10 text-rose-300",
      title: "Proposal Website Studio",
      category: "showcase",
      highlight: "5 Premium Themes",
      description:
        "Create a private, animated proposal website with a love story, photo and a 'Yes' button that celebrates. Send a link and delete it anytime.",
      features: [
        "5 Cinematic Themes",
        "Private Shareable Link",
        "Runaway 'No' Button",
        "WhatsApp Reply on YES",
      ],
    },
    {
      id: "msg",
      href: "/msg",
      icon: "✉️",
      badge: "Agency Outreach",
      badgeColor: "border-violet-500/30 bg-violet-500/10 text-violet-300",
      title: "Client Acquisition & Pitch Maker",
      category: "enterprise",
      highlight: "English · Hindi · Kannada",
      description:
        "Automate customized, persuasive WhatsApp and Instagram pitch messages for local business owners with one-tap link embedding.",
      features: [
        "Multilingual Templates",
        "Customer Link Generator",
        "Follow-up Cadence (Day 1, 3)",
        "Deal Status Tracking",
      ],
    },
  ];

  const filteredApps = apps.filter((a) => {
    if (filter === "all") return true;
    return a.category === filter;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* LUXURY GLOW BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute bottom-10 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* TOP LUXURY NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090e]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-lg shadow-[0_0_25px_rgba(245,158,11,0.35)]">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">
                  APEX SUITE{" "}
                  <span className="text-amber-400 font-serif italic text-sm">
                    Enterprise
                  </span>
                </span>
                <span className="hidden sm:inline-block rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  v2.5 Pro
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Digital Platforms for Elite Businesses
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(OWNER.message)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2 text-xs font-black text-black shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-95"
            >
              <span>Get Free Demo With My Brand</span>
              <span className="text-sm">→</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 pb-12 pt-16 sm:px-6 sm:pt-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <span>✨</span> Next-Gen Business Infrastructure
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Empower Your Business With{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              World-Class Software
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            CRM pipelines, automated HRMS payroll, GST billing engines,
            contactless restaurant QR ordering & boutique showcases — customized
            with your logo, colors, and currency.
          </p>

          {/* Quick CTA row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3.5 text-sm font-extrabold text-black shadow-xl shadow-amber-500/25 transition hover:brightness-110 active:scale-95"
            >
              Talk to Developer on WhatsApp
            </a>
            <a
              href="#demos"
              className="rounded-2xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              Explore All 9 Live Demos ↓
            </a>
          </div>

          {/* TRUST STATS */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <div className="text-xl font-black text-amber-400">48 Hours</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Live On Your Domain
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <div className="text-xl font-black text-emerald-400">
                0% Commission
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Keep 100% Profits
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <div className="text-xl font-black text-indigo-400">
                GST / VAT
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Compliant Invoicing
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <div className="text-xl font-black text-cyan-400">Mobile PWA</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Works On Any Device
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <section id="demos" className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white">
              Executive Demo Suite{" "}
              <span className="text-amber-400 font-serif italic text-base">
                ({apps.length} Applications)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any demo below to experience the live client environment.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0e121d] p-1.5 shadow-inner">
            {[
              { id: "all", label: "All Demos" },
              { id: "enterprise", label: "Enterprise (CRM / HRMS / Billing)" },
              { id: "commerce", label: "Commerce & Dining" },
              { id: "showcase", label: "High-Ticket Showcases" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === btn.id
                    ? "bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE APPS GRID */}
      <section className="mx-auto max-w-7xl p-4 sm:p-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <a
              key={app.id}
              href={app.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111625] to-[#0a0d16] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10"
            >
              {/* Corner accent glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl group-hover:bg-amber-400/20 transition" />

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-3xl shadow-md group-hover:scale-110 group-hover:bg-white/10 transition-transform">
                    {app.icon}
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${app.badgeColor}`}
                  >
                    {app.badge}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                    {app.highlight}
                  </div>
                  <h3 className="mt-1 text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                    {app.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-light">
                    {app.description}
                  </p>
                </div>

                {/* Features list */}
                <div className="mt-5 space-y-1.5 border-t border-white/5 pt-4">
                  {app.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-400"
                    >
                      <span className="text-amber-400 text-xs font-bold">
                        ✓
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                  Launch Interactive Demo <span>→</span>
                </span>
                <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-semibold text-slate-400 group-hover:text-white">
                  Live
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* BOTTOM CONTACT CALLOUT */}
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#0d111c] to-black/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <span className="text-3xl">🚀</span>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-4xl">
            Ready to deploy this for your brand?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300 leading-relaxed font-light">
            I can tailor and launch any of these systems for your showroom,
            agency, restaurant, or service business within 48 hours.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3 text-sm font-extrabold text-black shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-95"
            >
              Get Custom Quote on WhatsApp
            </a>
            <a
              href="tel:+919380195144"
              className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Direct Call: {OWNER.whatsapp}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black/60 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          <div className="font-semibold text-slate-400">
            Apex Enterprise Suite · Developed by {OWNER.name}
          </div>
          <div className="mt-1">
            Secure · No Monthly Commission · Multi-Currency · Full Source Code
            Ownership Available
          </div>
        </div>
      </footer>
    </div>
  );
}

function Root() {
  const isShort = first === "s";
  const [st, setSt] = useState(isShort ? "loading" : "ok");
  const [share, setShare] = useState(null);

  useEffect(() => {
    if (!isShort) return;
    getShare(parts[1])
      .then((r) => {
        if (r && r.active) {
          setShare(r);
          setSt("ok");
        } else setSt("dead");
      })
      .catch(() => setSt("dead"));
  }, []);

  if (st === "loading") return <Center>Loading...</Center>;
  if (st === "dead")
    return (
      <Center>
        <div className="text-5xl">🔒</div>
        <div className="mt-3 text-xl font-bold">
          This link is no longer active
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          Please contact the person who sent it.
        </p>
      </Center>
    );
  const which = share ? share.app : direct;
  const Page =
    {
      bill: Bill,
      crm: CRM,
      hrms: HRMS,
      site: Site,
      shop: Shop,
      dine: Dine,
      cars: Cars,
      estate: Estate,
      msg: Messages,
      proposal: Proposal,
    }[which] || Menu;
  return <Page shared={share?.data} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
