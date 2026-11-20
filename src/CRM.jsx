import React, { useState, useEffect, useMemo } from "react";
import { OWNER } from "./config";
import { createShare, LinkManager } from "./extras";

const STAGES = [
  { id: "lead", name: "New Leads", color: "#3b82f6", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "contacted", name: "Contacted", color: "#8b5cf6", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "proposal", name: "Proposal Sent", color: "#f59e0b", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "negotiation", name: "Negotiation", color: "#ec4899", bg: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { id: "won", name: "Closed Won", color: "#10b981", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
];

const INITIAL_DEALS = [
  {
    id: 1,
    title: "Commercial Architectural Fabrication",
    client: "Vikram Malhotra",
    company: "Apex Infra & Towers",
    phone: "9876543210",
    email: "vikram@apexinfra.com",
    value: 850000,
    stage: "proposal",
    priority: "High",
    source: "Referral",
    date: "2026-11-18",
    notes: "Requires custom laser cut MS façade and architectural railing. Met on site.",
    activities: [
      { id: 1, type: "Meeting", note: "Site inspection at Indiranagar project.", date: "18 Nov 2026" },
      { id: 2, type: "Proposal", note: "Sent initial quotation ₹8.5L with GST breakdown.", date: "19 Nov 2026" }
    ]
  },
  {
    id: 2,
    title: "Luxury Villa Interior & Glass Paneling",
    client: "Ananya Deshmukh",
    company: "Deshmukh Estates",
    phone: "9845012345",
    email: "ananya@deshmukh.in",
    value: 1200000,
    stage: "negotiation",
    priority: "Urgent",
    source: "Website Demo",
    date: "2026-11-15",
    notes: "High net-worth client. 15% advance discussed, awaiting final approval on glass tint.",
    activities: [
      { id: 1, type: "Call", note: "Discussed discount structure with client architect.", date: "17 Nov 2026" }
    ]
  },
  {
    id: 3,
    title: "Annual Billing & ERP SaaS Deployment",
    client: "Rajesh Singhania",
    company: "Singhania Logistics",
    phone: "9900112233",
    email: "rajesh@singhanialogistics.com",
    value: 450000,
    stage: "won",
    priority: "Medium",
    source: "Direct",
    date: "2026-11-12",
    notes: "Agreement signed for multi-branch accounting and automated e-way bill generation.",
    activities: [
      { id: 1, type: "Payment", note: "Received ₹2.25L 50% advance token via RTGS.", date: "16 Nov 2026" }
    ]
  },
  {
    id: 4,
    title: "Chain Store POS & QR Integration",
    client: "Kavita Reddy",
    company: "Reddy Organics (4 Outlets)",
    phone: "9880192837",
    email: "kavita@reddyorganics.com",
    value: 320000,
    stage: "contacted",
    priority: "Medium",
    source: "Instagram",
    date: "2026-11-19",
    notes: "Demo shown on iPad. Interested in kitchen screen + QR order system.",
    activities: [
      { id: 1, type: "Demo", note: "Walkthrough of Dine & Kitchen live sync screen.", date: "19 Nov 2026" }
    ]
  },
  {
    id: 5,
    title: "Industrial Warehouse Safety Gates",
    client: "Sameer Joshi",
    company: "Joshi Warehousing Corp",
    phone: "9731234567",
    email: "sameer@joshiwarehouse.in",
    value: 620000,
    stage: "lead",
    priority: "High",
    source: "Google Map",
    date: "2026-11-20",
    notes: "Incoming enquiry for 3 heavy automated motorized rolling gates.",
    activities: []
  },
  {
    id: 6,
    title: "Executive Luxury Fleets Digital Catalog",
    client: "Tariq Mansoor",
    company: "Crown Prestige Motors",
    phone: "9611223344",
    email: "tariq@crownmotors.ae",
    value: 280000,
    stage: "proposal",
    priority: "Low",
    source: "Referral",
    date: "2026-11-16",
    notes: "Wants digital showroom website with EMI calculator and WhatsApp enquiry.",
    activities: []
  }
];

export default function CRM({ shared }) {
  const [deals, setDeals] = useState(() => {
    try {
      const saved = localStorage.getItem("crm-deals-data");
      return saved ? JSON.parse(saved) : INITIAL_DEALS;
    } catch {
      return INITIAL_DEALS;
    }
  });

  const [view, setView] = useState("pipeline"); // pipeline | table | contacts | analytics
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [newActivityNote, setNewActivityNote] = useState("");
  const [newActivityType, setNewActivityType] = useState("Note");

  const [formData, setFormData] = useState({
    title: "",
    client: "",
    company: "",
    phone: "",
    email: "",
    value: "",
    stage: "lead",
    priority: "Medium",
    source: "Direct",
    notes: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm-deals-data", JSON.stringify(deals));
    } catch {}
  }, [deals]);

  const money = (val) => "₹" + (+val || 0).toLocaleString("en-IN");

  // Metrics
  const totalPipeline = useMemo(() => deals.reduce((sum, d) => sum + (+d.value || 0), 0), [deals]);
  const wonDeals = useMemo(() => deals.filter((d) => d.stage === "won"), [deals]);
  const wonValue = useMemo(() => wonDeals.reduce((sum, d) => sum + (+d.value || 0), 0), [wonDeals]);
  const winRate = useMemo(() => {
    if (deals.length === 0) return 0;
    return Math.round((wonDeals.length / deals.length) * 100);
  }, [deals, wonDeals]);

  // Filtering
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      const matchSearch =
        (d.title + " " + d.client + " " + d.company + " " + d.notes)
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchPriority = priorityFilter === "All" || d.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [deals, search, priorityFilter]);

  const moveStage = (dealId, nextStage) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: nextStage } : d))
    );
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal((curr) => ({ ...curr, stage: nextStage }));
    }
  };

  const deleteDeal = (dealId) => {
    if (confirm("Delete this deal record permanently?")) {
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      setSelectedDeal(null);
    }
  };

  const handleAddDeal = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.client) {
      alert("Please provide at least a Deal Title and Client Name.");
      return;
    }
    const newDeal = {
      id: Date.now(),
      ...formData,
      value: +formData.value || 0,
      date: new Date().toISOString().slice(0, 10),
      activities: [
        { id: Date.now(), type: "Created", note: "Deal initiated in pipeline.", date: "Today" }
      ]
    };
    setDeals([newDeal, ...deals]);
    setNewDealOpen(false);
    setFormData({
      title: "",
      client: "",
      company: "",
      phone: "",
      email: "",
      value: "",
      stage: "lead",
      priority: "Medium",
      source: "Direct",
      notes: "",
    });
  };

  const addActivity = () => {
    if (!newActivityNote.trim()) return;
    const act = {
      id: Date.now(),
      type: newActivityType,
      note: newActivityNote,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
    const updated = {
      ...selectedDeal,
      activities: [act, ...(selectedDeal.activities || [])]
    };
    setSelectedDeal(updated);
    setDeals(deals.map((d) => (d.id === selectedDeal.id ? updated : d)));
    setNewActivityNote("");
  };

  const waLead = (d) => {
    const text = `Hi ${d.client}, following up from ${OWNER.name} regarding your requirement: "${d.title}". When is a good time for a quick 2-minute sync?`;
    const cleanPhone = (d.phone || "").replace(/\D/g, "");
    const num = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone || OWNER.whatsapp;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* LUXURY TOP NAV */}
      <header className="sticky top-0 z-30 border-b border-amber-500/20 bg-[#07090e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:border-amber-400 hover:text-white"
            >
              <span>← All Apps Hub</span>
            </a>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-base shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                💼
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-white text-base">
                    Apex CRM <span className="text-amber-400 font-serif italic text-sm">Enterprise</span>
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    Live Pipeline
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">High-Conversion Deal Flow & Client Management</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setNewDealOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-extrabold text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
            >
              <span className="text-base font-bold leading-none">+</span> New Deal
            </button>
            <a
              href={`https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent("Hi! I'm interested in getting the Apex CRM application for my business.")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <span>Contact Sales</span>
            </a>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="border-t border-white/5 bg-[#0b0e17]/80 px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-slate-400">Pipeline Value: </span>
                <span className="font-bold text-amber-400 text-sm tracking-wide">{money(totalPipeline)}</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div>
                <span className="text-slate-400">Won Revenue: </span>
                <span className="font-bold text-emerald-400 text-sm tracking-wide">{money(wonValue)}</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div>
                <span className="text-slate-400">Active Deals: </span>
                <span className="font-bold text-white text-sm">{deals.length}</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div>
                <span className="text-slate-400">Win Rate: </span>
                <span className="font-bold text-cyan-400 text-sm">{winRate}%</span>
              </div>
            </div>

            {/* View tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/10">
              {[
                { id: "pipeline", label: "Pipeline Board", icon: "☵" },
                { id: "table", label: "All Deals", icon: "☰" },
                { id: "contacts", label: "Contacts", icon: "👥" },
                { id: "analytics", label: "Funnel Analytics", icon: "📊" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition ${
                    view === tab.id
                      ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* FILTER & SEARCH BAR */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0e121d]/70 p-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by deal name, company, client, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Priority:</span>
            {["All", "Urgent", "High", "Medium", "Low"].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  priorityFilter === p
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* VIEW 1: KANBAN PIPELINE */}
        {view === "pipeline" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {STAGES.map((col) => {
              const colDeals = filteredDeals.filter((d) => d.stage === col.id);
              const colValue = colDeals.reduce((sum, d) => sum + (+d.value || 0), 0);
              return (
                <div
                  key={col.id}
                  className="flex flex-col rounded-2xl border border-white/10 bg-[#0c101a]/80 p-3 shadow-xl backdrop-blur-sm"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        {col.name}
                      </h3>
                      <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-bold text-slate-400">
                        {colDeals.length}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-400/90">{money(colValue)}</span>
                  </div>

                  {/* Deals in this column */}
                  <div className="mt-3 flex-1 space-y-3 overflow-y-auto min-h-[420px]">
                    {colDeals.length === 0 && (
                      <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/5 text-center text-xs text-slate-600">
                        No active deals
                      </div>
                    )}
                    {colDeals.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDeal(d)}
                        className="group relative cursor-pointer rounded-xl border border-white/10 bg-[#121624] p-3.5 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/50 hover:shadow-amber-500/10"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              d.priority === "Urgent"
                                ? "border-red-500/30 bg-red-500/10 text-red-400"
                                : d.priority === "High"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                                : "border-slate-500/30 bg-slate-500/10 text-slate-400"
                            }`}
                          >
                            {d.priority}
                          </span>
                          <span className="text-[10px] text-slate-500">{d.source}</span>
                        </div>

                        <h4 className="mt-2 font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                          {d.title}
                        </h4>

                        <div className="mt-1 text-xs text-slate-400 truncate">
                          {d.client} · <span className="text-slate-500">{d.company}</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                          <div className="font-extrabold text-amber-400 text-sm">
                            {money(d.value)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={waLead(d)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Chat on WhatsApp"
                              className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400 transition hover:bg-emerald-500/40"
                            >
                              💬
                            </a>
                            <span className="text-[10px] text-slate-500">
                              {d.activities?.length || 0} logs
                            </span>
                          </div>
                        </div>

                        {/* Quick stage jump */}
                        <div
                          className="mt-2.5 flex items-center gap-1 border-t border-white/5 pt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px] text-slate-500">Move:</span>
                          <select
                            value={d.stage}
                            onChange={(e) => moveStage(d.id, e.target.value)}
                            className="flex-1 rounded-md border border-white/10 bg-black/60 px-1.5 py-1 text-[10px] text-slate-300 outline-none"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: TABLE LIST */}
        {view === "table" && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c101a] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/5 uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">Deal Title</th>
                    <th className="px-4 py-3.5 font-bold">Client / Company</th>
                    <th className="px-4 py-3.5 font-bold">Stage</th>
                    <th className="px-4 py-3.5 font-bold">Priority</th>
                    <th className="px-4 py-3.5 font-bold text-right">Value</th>
                    <th className="px-4 py-3.5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDeals.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDeal(d)}
                      className="cursor-pointer transition hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-semibold text-white">
                        <div>{d.title}</div>
                        <div className="text-[10px] text-slate-500">Created: {d.date}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{d.client}</div>
                        <div className="text-[11px] text-slate-400">{d.company}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            STAGES.find((s) => s.id === d.stage)?.bg || ""
                          }`}
                        >
                          {STAGES.find((s) => s.id === d.stage)?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-300">{d.priority}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-amber-400">
                        {money(d.value)}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={waLead(d)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/40"
                          >
                            WhatsApp
                          </a>
                          <button
                            onClick={() => deleteDeal(d.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: CONTACTS DIRECTORY */}
        {view === "contacts" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-white/10 bg-[#0e121d] p-5 shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 font-extrabold text-white text-base">
                    {d.client.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-sm truncate">{d.client}</h3>
                    <div className="text-xs text-amber-400/90 font-medium truncate">{d.company}</div>
                  </div>
                  <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                    {d.source}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <a href={`tel:${d.phone}`} className="font-mono text-slate-200 hover:text-amber-400">
                      {d.phone || "—"}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Email:</span>
                    <a href={`mailto:${d.email}`} className="text-slate-200 hover:text-amber-400 truncate max-w-[180px]">
                      {d.email || "—"}
                    </a>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-slate-500">Pipeline Deal:</span>
                    <span className="font-bold text-amber-400">{money(d.value)}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={waLead(d)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 py-2 text-center text-xs font-bold text-emerald-300 hover:bg-emerald-500/40"
                  >
                    💬 Quick WhatsApp
                  </a>
                  <button
                    onClick={() => setSelectedDeal(d)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-center text-xs font-semibold text-slate-200 hover:bg-white/10"
                  >
                    View History
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 4: FUNNEL ANALYTICS */}
        {view === "analytics" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0e121d] p-5">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Deals</div>
                <div className="mt-2 text-3xl font-extrabold text-white">{deals.length}</div>
                <div className="mt-1 text-xs text-emerald-400">Across 5 sales milestones</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0e121d] p-5">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average Deal Size</div>
                <div className="mt-2 text-3xl font-extrabold text-amber-400">
                  {money(deals.length ? Math.round(totalPipeline / deals.length) : 0)}
                </div>
                <div className="mt-1 text-xs text-slate-400">High-ticket commercial clients</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0e121d] p-5">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Won Revenue Rate</div>
                <div className="mt-2 text-3xl font-extrabold text-emerald-400">{winRate}%</div>
                <div className="mt-1 text-xs text-slate-400">{wonDeals.length} deals closed successfully</div>
              </div>
            </div>

            {/* Visual Funnel */}
            <div className="rounded-2xl border border-white/10 bg-[#0e121d] p-6">
              <h3 className="font-bold text-base text-white">Deal Conversion Funnel</h3>
              <p className="mt-1 text-xs text-slate-400">Stage-by-stage attrition and deal volume</p>

              <div className="mt-6 space-y-4">
                {STAGES.map((s) => {
                  const count = deals.filter((d) => d.stage === s.id).length;
                  const pct = deals.length ? Math.round((count / deals.length) * 100) : 0;
                  const val = deals.filter((d) => d.stage === s.id).reduce((sum, d) => sum + (+d.value || 0), 0);
                  return (
                    <div key={s.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">{s.name} ({count})</span>
                        <span className="font-semibold text-amber-400">{money(val)} · {pct}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, 6)}%`,
                            backgroundColor: s.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: DEAL DETAILS & ACTIVITY TIMELINE */}
      {selectedDeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDeal(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0f1422] p-6 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                    STAGES.find((s) => s.id === selectedDeal.stage)?.bg || ""
                  }`}
                >
                  {STAGES.find((s) => s.id === selectedDeal.stage)?.name}
                </span>
                <h2 className="mt-2 text-xl font-extrabold text-white">{selectedDeal.title}</h2>
                <div className="text-xs text-slate-400">
                  {selectedDeal.client} · {selectedDeal.company}
                </div>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="rounded-full bg-white/10 p-2 text-sm text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-black/40 p-3.5 text-xs sm:grid-cols-4">
              <div>
                <div className="text-slate-500">Value</div>
                <div className="text-base font-bold text-amber-400">{money(selectedDeal.value)}</div>
              </div>
              <div>
                <div className="text-slate-500">Priority</div>
                <div className="font-semibold text-white">{selectedDeal.priority}</div>
              </div>
              <div>
                <div className="text-slate-500">Source</div>
                <div className="font-semibold text-white">{selectedDeal.source}</div>
              </div>
              <div>
                <div className="text-slate-500">Created</div>
                <div className="font-semibold text-white">{selectedDeal.date}</div>
              </div>
            </div>

            {selectedDeal.notes && (
              <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-slate-300">
                <div className="font-semibold text-slate-400 mb-1">Internal Notes:</div>
                {selectedDeal.notes}
              </div>
            )}

            {/* Stage Selector */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-black/30 p-3">
              <span className="text-xs font-semibold text-slate-300">Advance Stage:</span>
              <div className="flex flex-wrap gap-1">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => moveStage(selectedDeal.id, s.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedDeal.stage === s.id
                        ? "bg-amber-400 text-black font-bold"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Activity Log */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Log New Client Touchpoint
              </h3>
              <div className="mt-2.5 flex gap-2">
                <select
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white"
                >
                  <option>Call</option>
                  <option>Meeting</option>
                  <option>Proposal</option>
                  <option>Demo</option>
                  <option>Payment</option>
                  <option>Note</option>
                </select>
                <input
                  type="text"
                  placeholder="e.g. Sent revised price quotation or called client..."
                  value={newActivityNote}
                  onChange={(e) => setNewActivityNote(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
                <button
                  onClick={addActivity}
                  className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black hover:bg-amber-300"
                >
                  Log
                </button>
              </div>

              {/* Activity Timeline */}
              <div className="mt-4 space-y-2">
                {selectedDeal.activities?.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/30 p-2.5 text-xs"
                  >
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                      {a.type}
                    </span>
                    <span className="flex-1 text-slate-300">{a.note}</span>
                    <span className="text-[10px] text-slate-500">{a.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-white/10 pt-4">
              <button
                onClick={() => deleteDeal(selectedDeal.id)}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20"
              >
                Delete Deal
              </button>
              <div className="flex gap-2">
                <a
                  href={waLead(selectedDeal)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400"
                >
                  Chat on WhatsApp
                </a>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW DEAL */}
      {newDealOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setNewDealOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f1422] p-6 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-lg text-white">Create New Deal</h3>
              <button onClick={() => setNewDealOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddDeal} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Deal / Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Penthouse Renovation & Fabrication"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Reddy"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Reddy Developers"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Deal Value (₹)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none"
                  >
                    <option>Urgent</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Notes / Project Scope</label>
                <textarea
                  rows={2}
                  placeholder="Key specifications, expected closing timeline..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="mt-4 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewDealOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 font-bold text-black shadow-lg shadow-amber-500/20"
                >
                  Add to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
