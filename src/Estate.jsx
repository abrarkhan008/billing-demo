import { useState, useEffect, useMemo } from "react";
import { OWNER } from "./config";
import { estatePresets } from "./presets";
import { LinkManager, ImageInput, readImage } from "./extras";

/* ========== STARTING DETAILS (all editable inside the website) ========== */
const DEFAULT = {
  name: "Your Realty",
  tagline: "Find a home you will love living in",
  phone: "9999999999",
  whatsapp: "919999999999",
  address: "Indiranagar, Bengaluru",
  hours: "Mon–Sat 9:30 AM – 7:30 PM, Sun by appointment",
  rera: "",
  color: "#0e5a47",
  currency: "₹",
  hero: "",
  about:
    "We help families buy, sell and rent homes across the city. Every listing is visited by our team, every document is checked, and you pay no brokerage surprises.",
  agent: "Your Name",
  agentRole: "Founder & Property Consultant",
  agentPhoto: "",
  years: "10",
  sold: "650",
  clients: "900",
  services: [
    {
      title: "Buy a property",
      text: "Verified listings, site visits and price negotiation done for you.",
    },
    {
      title: "Sell your property",
      text: "Photos, listing and genuine buyers. Sold at the right price.",
    },
    {
      title: "Rent or lease",
      text: "Tenant screening, agreement and police verification handled.",
    },
    {
      title: "Legal and loans",
      text: "Document check, registration help and home loan tie-ups.",
    },
  ],
  areas:
    "Indiranagar, Whitefield, HSR Layout, Koramangala, Electronic City, Hebbal",
  properties: [
    {
      id: 1,
      title: "3 BHK in Prestige Lakeside",
      type: "Apartment",
      mode: "Sale",
      locality: "Whitefield",
      price: 14500000,
      beds: 3,
      baths: 3,
      area: 1650,
      facing: "East",
      furnishing: "Semi-furnished",
      floor: "8 of 14",
      age: "2 years",
      amenities:
        "Clubhouse, Swimming pool, Gym, 24x7 security, Power backup, Covered parking",
      desc: "Bright corner apartment with lake views, wide balcony and two parking slots. Walk to the tech park.",
      status: "available",
      featured: true,
      imgs: [],
    },
    {
      id: 2,
      title: "4 BHK Independent Villa",
      type: "Villa",
      mode: "Sale",
      locality: "Sarjapur Road",
      price: 32000000,
      beds: 4,
      baths: 5,
      area: 3200,
      facing: "North",
      furnishing: "Unfurnished",
      floor: "G+2",
      age: "New",
      amenities:
        "Private garden, Terrace, Lift, Solar water, CCTV, Gated community",
      desc: "Modern villa in a gated layout with a private garden and a rooftop terrace.",
      status: "available",
      featured: true,
      imgs: [],
    },
    {
      id: 3,
      title: "2 BHK near Metro",
      type: "Apartment",
      mode: "Rent",
      locality: "Indiranagar",
      price: 38000,
      beds: 2,
      baths: 2,
      area: 1100,
      facing: "West",
      furnishing: "Fully furnished",
      floor: "3 of 6",
      age: "5 years",
      amenities: "Lift, Parking, Power backup, Water 24x7",
      desc: "Fully furnished, 5 minutes from the metro. Ideal for working professionals.",
      status: "available",
      featured: false,
      imgs: [],
    },
    {
      id: 4,
      title: "Residential Plot 30x40",
      type: "Plot",
      mode: "Sale",
      locality: "Devanahalli",
      price: 6800000,
      beds: 0,
      baths: 0,
      area: 1200,
      facing: "East",
      furnishing: "-",
      floor: "-",
      age: "-",
      amenities: "BDA approved, Clear title, Corner plot, Wide road",
      desc: "East-facing corner plot in an approved layout, near the airport road.",
      status: "available",
      featured: false,
      imgs: [],
    },
    {
      id: 5,
      title: "Office Space 1,800 sq ft",
      type: "Commercial",
      mode: "Rent",
      locality: "HSR Layout",
      price: 120000,
      beds: 0,
      baths: 2,
      area: 1800,
      facing: "North",
      furnishing: "Furnished",
      floor: "2 of 4",
      age: "3 years",
      amenities: "Lift, Parking, Power backup, Cafeteria",
      desc: "Ready-to-move office with 20 workstations and a meeting room.",
      status: "available",
      featured: false,
      imgs: [],
    },
    {
      id: 6,
      title: "2 BHK Apartment",
      type: "Apartment",
      mode: "Sale",
      locality: "Electronic City",
      price: 6200000,
      beds: 2,
      baths: 2,
      area: 1050,
      facing: "North",
      furnishing: "Unfurnished",
      floor: "5 of 12",
      age: "1 year",
      amenities: "Gym, Park, Kids play area, Security",
      desc: "Affordable and well connected, close to schools and the expressway.",
      status: "sold",
      featured: false,
      imgs: [],
    },
  ],
  reviews: [
    {
      who: "Arjun & Divya, Whitefield",
      text: "They showed us only homes that matched our budget and checked every paper. We moved in within a month.",
    },
    {
      who: "Kavitha, Indiranagar",
      text: "Found a tenant for my flat in four days, with the agreement done properly.",
    },
  ],
};

const slug = location.pathname.split("/")[2];

function load(shared) {
  let d = DEFAULT;
  if (!shared) {
    try {
      const x = JSON.parse(localStorage.getItem("estate-data"));
      if (x) d = { ...DEFAULT, ...x };
    } catch {}
  }
  if (estatePresets[slug]) d = { ...d, ...estatePresets[slug] };
  if (shared) d = { ...d, ...shared };
  return d;
}

const inp =
  "w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900";
const H = ({ children }) => (
  <h3 className="border-t pt-3 text-sm font-bold text-slate-800">{children}</h3>
);
const TYPES = ["Apartment", "Villa", "House", "Plot", "Commercial"];
const INK = "#10211c";
const SERIF = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

function HomeArt({ color }) {
  return (
    <svg
      viewBox="0 0 240 150"
      className="h-full w-full"
      style={{ background: color + "18" }}
    >
      <rect x="0" y="118" width="240" height="32" fill={color} opacity=".18" />
      <rect x="40" y="58" width="90" height="62" fill={color} opacity=".9" />
      <path d="M32 60 L85 22 L138 60 Z" fill={INK} opacity=".85" />
      <rect x="130" y="40" width="70" height="80" fill={color} opacity=".6" />
      {[0, 1, 2].map((r) =>
        [0, 1].map((k) => (
          <rect
            key={r + "" + k}
            x={146 + k * 28}
            y={52 + r * 22}
            width="16"
            height="13"
            fill="#fff"
            opacity=".8"
          />
        )),
      )}
      <rect x="72" y="86" width="22" height="34" fill="#fff" opacity=".85" />
      <rect x="50" y="72" width="14" height="14" fill="#fff" opacity=".8" />
      <rect x="102" y="72" width="14" height="14" fill="#fff" opacity=".8" />
    </svg>
  );
}

export default function Estate({ shared }) {
  const [d, setD] = useState(() => load(shared));
  const isShared = !!shared || !!estatePresets[slug];
  const [mode, setMode] = useState("Sale");
  const [type, setType] = useState("All");
  const [loc, setLoc] = useState("All");
  const [beds, setBeds] = useState(0);
  const [maxP, setMaxP] = useState(0);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [sel, setSel] = useState(null);
  const [pic, setPic] = useState(0);
  const [saved, setSaved] = useState([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [emi, setEmi] = useState({ down: 20, years: 20, rate: 8.75 });
  const [lead, setLead] = useState({ name: "", phone: "", note: "" });
  const [list2, setList2] = useState({
    name: "",
    phone: "",
    kind: "",
    place: "",
    price: "",
  });
  const [open, setOpen] = useState(false);
  const [askPass, setAskPass] = useState(false);
  const [passIn, setPassIn] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(l);
  }, []);

  const c = d.color;
  const save = (n) => {
    setD(n);
    try {
      localStorage.setItem("estate-data", JSON.stringify(n));
    } catch {
      alert("Storage is full. Use fewer or smaller photos.");
    }
  };
  const set = (k, v) => save({ ...d, [k]: v });
  const upP = (i, k, v) =>
    set(
      "properties",
      d.properties.map((x, j) => (j === i ? { ...x, [k]: v } : x)),
    );
  const upS = (i, k, v) =>
    set(
      "services",
      d.services.map((x, j) => (j === i ? { ...x, [k]: v } : x)),
    );
  const addPhoto = (i, f) =>
    readImage(f, 900, "image/jpeg", (x) =>
      setD((old) => {
        const n = {
          ...old,
          properties: old.properties.map((p, j) =>
            j === i ? { ...p, imgs: [...(p.imgs || []), x] } : p,
          ),
        };
        try {
          localStorage.setItem("estate-data", JSON.stringify(n));
        } catch {}
        return n;
      }),
    );

  const full = (n) => d.currency + (+n || 0).toLocaleString("en-IN");
  const price = (p) => {
    const v = +p.price || 0;
    if (p.mode === "Rent") return full(v) + "/mo";
    if (v >= 1e7)
      return `${d.currency}${(v / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
    if (v >= 1e5)
      return `${d.currency}${(v / 1e5).toFixed(2).replace(/\.?0+$/, "")} Lakh`;
    return full(v);
  };
  const emiOf = (p) => {
    const P = p * (1 - emi.down / 100),
      r = emi.rate / 1200,
      n = emi.years * 12;
    return r === 0
      ? P / n
      : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const places = [
    "All",
    ...new Set(d.properties.map((p) => p.locality).filter(Boolean)),
  ];
  const budgets =
    mode === "Rent"
      ? [20000, 40000, 75000, 150000]
      : [5000000, 10000000, 20000000, 50000000];
  const shown = useMemo(() => {
    const r = d.properties.filter(
      (p) =>
        p.mode === mode &&
        (type === "All" || p.type === type) &&
        (loc === "All" || p.locality === loc) &&
        (!beds || p.beds >= beds) &&
        (!maxP || p.price <= maxP) &&
        (!onlySaved || saved.includes(p.id)) &&
        (p.title + " " + p.locality).toLowerCase().includes(q.toLowerCase()),
    );
    const s = {
      new: (a, b) => b.id - a.id,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      area: (a, b) => b.area - a.area,
    };
    return r.sort(
      (a, b) => (b.featured === true) - (a.featured === true) || s[sort](a, b),
    );
  }, [d.properties, mode, type, loc, beds, maxP, q, sort, onlySaved, saved]);

  const wa = (msg, to = d.whatsapp) =>
    `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
  const ask = (p, kind) =>
    wa(
      kind === "visit"
        ? `Hi, I'd like to schedule a site visit for "${p.title}" in ${p.locality} (${price(p)}). Which days are free?`
        : `Hi, I'm interested in "${p.title}" in ${p.locality} (${price(p)}). Is it still available?`,
    );
  const sendLead = () => {
    if (!lead.name || !lead.phone)
      return alert("Please enter your name and phone number");
    window.open(
      wa(
        `Hi, I'm looking for a property.\nName: ${lead.name}\nPhone: ${lead.phone}\nRequirement: ${lead.note || "-"}`,
      ),
      "_blank",
    );
  };
  const sendList = () => {
    if (!list2.phone || !list2.kind)
      return alert("Please enter property type and phone number");
    window.open(
      wa(
        `I want to list my property.\nName: ${list2.name || "-"}\nPhone: ${list2.phone}\nProperty: ${list2.kind}\nLocation: ${list2.place || "-"}\nExpected price: ${list2.price || "-"}`,
      ),
      "_blank",
    );
  };
  const toggleSave = (id) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const tryEdit = () =>
    unlocked ? setOpen(true) : (setPassIn(""), setAskPass(true));
  const checkPass = () => {
    if (passIn === OWNER.password) {
      setUnlocked(true);
      setAskPass(false);
      setOpen(true);
    } else alert("Wrong password");
  };
  const myWa = wa(OWNER.message, OWNER.whatsapp);
  const mapEmbed = (a) =>
    `https://www.google.com/maps?q=${encodeURIComponent(a)}&output=embed`;
  const initials = (d.agent || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const Badge = ({ p }) =>
    p.status !== "available" ? (
      <span className="absolute left-3 top-3 rounded bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
        {p.mode === "Rent" ? "RENTED" : "SOLD"}
      </span>
    ) : (
      <span className="absolute left-3 top-3 flex gap-1.5">
        {p.featured && (
          <span className="rounded bg-amber-400 px-2.5 py-1 text-xs font-bold text-slate-900">
            Featured
          </span>
        )}
        <span className="rounded bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800">
          {p.type}
        </span>
      </span>
    );
  const Spec = ({ l, v }) => (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-[11px] text-slate-500">{l}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-900">
        {v || "—"}
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#f6f7f6] text-slate-800"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* NAV */}
      <header
        className="sticky top-0 z-20 text-white shadow-lg"
        style={{ background: INK }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div
            className="min-w-0 flex-1 truncate text-2xl font-bold"
            style={SERIF}
          >
            {d.name}
          </div>
          <nav className="hidden gap-5 text-sm text-slate-300 sm:flex">
            <a href="#listings" className="hover:text-white">
              Properties
            </a>
            <a href="#list" className="hover:text-white">
              Sell or rent out
            </a>
            <a href="#services" className="hover:text-white">
              Services
            </a>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </nav>
          <a
            href={"tel:" + d.phone}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: c }}
          >
            Call {d.phone}
          </a>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative text-white"
        style={{
          background: d.hero
            ? `url(${d.hero}) center/cover`
            : `linear-gradient(120deg, ${INK} 30%, ${c})`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,18,15,.85), rgba(8,18,15,.3))",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-14 sm:pt-24">
          <h1
            className="max-w-2xl text-5xl font-bold leading-[1.02] sm:text-7xl"
            style={SERIF}
          >
            {d.tagline}
          </h1>
          <p className="mt-4 max-w-lg text-slate-200">
            Buy, sell or rent with a team that checks every document and visits
            every property first.
          </p>
          {d.rera && (
            <p className="mt-3 text-sm text-slate-300">
              RERA registration: {d.rera}
            </p>
          )}
        </div>
      </section>

      {/* SEARCH */}
      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-3">
        <div className="rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200">
          <div className="mb-3 flex gap-2">
            {["Sale", "Rent"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setMaxP(0);
                }}
                className="rounded-full px-5 py-2 text-sm font-semibold"
                style={
                  mode === m
                    ? { background: c, color: "#fff" }
                    : { background: "#f1f5f4" }
                }
              >
                {m === "Sale" ? "Buy" : "Rent"}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-5">
            <input
              className={inp + " sm:col-span-2"}
              placeholder="Search area or property name"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className={inp}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {["All", ...TYPES].map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All types" : t}
                </option>
              ))}
            </select>
            <select
              className={inp}
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
            >
              {places.map((p) => (
                <option key={p} value={p}>
                  {p === "All" ? "All areas" : p}
                </option>
              ))}
            </select>
            <select
              className={inp}
              value={maxP}
              onChange={(e) => setMaxP(+e.target.value)}
            >
              <option value={0}>Any budget</option>
              {budgets.map((v) => (
                <option key={v} value={v}>
                  Under {price({ price: v, mode })}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Bedrooms</span>
            {[0, 1, 2, 3, 4].map((b) => (
              <button
                key={b}
                onClick={() => setBeds(b)}
                className="rounded-full px-3 py-1.5 font-semibold"
                style={
                  beds === b
                    ? { background: INK, color: "#fff" }
                    : { background: "#f1f5f4" }
                }
              >
                {b === 0 ? "Any" : b + "+"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NUMBERS */}
      <section className="mx-auto mt-8 grid max-w-6xl grid-cols-3 gap-3 px-3">
        {[
          [d.sold + "+", "properties sold"],
          [d.clients + "+", "happy families"],
          [d.years + " years", "in the city"],
        ].map(([a, b]) => (
          <div
            key={b}
            className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/70"
          >
            <div
              className="text-3xl font-bold leading-none"
              style={{ ...SERIF, color: c }}
            >
              {a}
            </div>
            <div className="mt-1 text-xs text-slate-500">{b}</div>
          </div>
        ))}
      </section>

      {/* LISTINGS */}
      <section
        id="listings"
        className="mx-auto max-w-6xl scroll-mt-16 px-3 py-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-4xl font-bold" style={{ ...SERIF, color: INK }}>
            {mode === "Sale" ? "Properties for sale" : "Properties for rent"} (
            {shown.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className="rounded-full px-4 py-2 text-xs font-semibold"
              style={
                onlySaved
                  ? { background: c, color: "#fff" }
                  : { background: "#fff", boxShadow: "0 0 0 1px #e2e8f0" }
              }
            >
              ♥ Saved ({saved.length})
            </button>
            <select
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="new">Newest</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="area">Largest area</option>
            </select>
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-lg"
            >
              <button
                className="relative block aspect-[16/11] w-full overflow-hidden text-left"
                onClick={() => {
                  setSel(p);
                  setPic(0);
                }}
              >
                {p.imgs?.[0] ? (
                  <img
                    src={p.imgs[0]}
                    alt={p.title}
                    loading="lazy"
                    className={
                      "h-full w-full object-cover " +
                      (p.status !== "available" ? "grayscale" : "")
                    }
                  />
                ) : (
                  <HomeArt color={c} />
                )}
                <Badge p={p} />
              </button>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="text-2xl font-bold leading-none"
                    style={{ ...SERIF, color: c }}
                  >
                    {price(p)}
                  </div>
                  <button
                    onClick={() => toggleSave(p.id)}
                    aria-label="Save"
                    className="text-xl leading-none"
                    style={{
                      color: saved.includes(p.id) ? "#dc2626" : "#cbd5e1",
                    }}
                  >
                    ♥
                  </button>
                </div>
                <h3 className="mt-2 truncate font-semibold">{p.title}</h3>
                <div className="text-sm text-slate-500">{p.locality}</div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-sm text-slate-700">
                  {p.beds > 0 && <span>{p.beds} bed</span>}
                  {p.baths > 0 && <span>{p.baths} bath</span>}
                  <span>{(+p.area).toLocaleString("en-IN")} sq ft</span>
                  {p.mode === "Sale" && p.area > 0 && (
                    <span className="text-slate-400">
                      {full(Math.round(p.price / p.area))}/sq ft
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSel(p);
                    setPic(0);
                  }}
                  className="mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
                  style={{ background: INK }}
                >
                  View details
                </button>
              </div>
            </article>
          ))}
        </div>
        {shown.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center text-slate-500">
            No properties match these filters. Tell us what you need below and
            we will find it.
          </div>
        )}

        {/* requirement form */}
        <div
          className="mt-8 grid gap-2 rounded-2xl p-4 text-white sm:grid-cols-4"
          style={{ background: c }}
        >
          <div className="sm:col-span-4 text-2xl font-bold" style={SERIF}>
            Can't find the right one? Tell us what you need.
          </div>
          <input
            className={inp}
            placeholder="Your name"
            value={lead.name}
            onChange={(e) => setLead({ ...lead, name: e.target.value })}
          />
          <input
            className={inp}
            inputMode="tel"
            placeholder="Phone number"
            value={lead.phone}
            onChange={(e) => setLead({ ...lead, phone: e.target.value })}
          />
          <input
            className={inp}
            placeholder="e.g. 3 BHK, Whitefield, under 1.5 Cr"
            value={lead.note}
            onChange={(e) => setLead({ ...lead, note: e.target.value })}
          />
          <button
            onClick={sendLead}
            className="rounded bg-slate-900 py-2 text-sm font-semibold"
          >
            Send on WhatsApp
          </button>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-16 bg-white px-3 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold" style={{ ...SERIF, color: INK }}>
            What we do for you
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.services.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border-t-4 bg-[#f6f7f6] p-5"
                style={{ borderColor: c }}
              >
                <div className="text-xl font-bold" style={SERIF}>
                  {s.title}
                </div>
                <p className="mt-2 text-sm text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
          {d.areas && (
            <div className="mt-8">
              <div className="text-sm font-semibold text-slate-700">
                Areas we cover
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {d.areas
                  .split(",")
                  .map((a) => a.trim())
                  .filter(Boolean)
                  .map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setLoc(places.includes(a) ? a : "All");
                        setQ(places.includes(a) ? "" : a);
                        document
                          .getElementById("listings")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-full border px-4 py-1.5 text-sm hover:bg-slate-50"
                    >
                      {a}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LIST YOUR PROPERTY */}
      <section
        id="list"
        className="scroll-mt-16 text-white"
        style={{ background: INK }}
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold sm:text-5xl" style={SERIF}>
              Selling or renting out a property?
            </h2>
            <p className="mt-3 max-w-md text-slate-300">
              Share the details. We will visit, take professional photos, list
              it, and bring you genuine buyers and tenants. You pay only when it
              is done.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl bg-white p-4 text-slate-900">
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inp}
                placeholder="Your name"
                value={list2.name}
                onChange={(e) => setList2({ ...list2, name: e.target.value })}
              />
              <input
                className={inp}
                inputMode="tel"
                placeholder="Phone number"
                value={list2.phone}
                onChange={(e) => setList2({ ...list2, phone: e.target.value })}
              />
            </div>
            <input
              className={inp}
              placeholder="Property (e.g. 2 BHK flat for sale)"
              value={list2.kind}
              onChange={(e) => setList2({ ...list2, kind: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inp}
                placeholder="Area / location"
                value={list2.place}
                onChange={(e) => setList2({ ...list2, place: e.target.value })}
              />
              <input
                className={inp}
                placeholder="Expected price or rent"
                value={list2.price}
                onChange={(e) => setList2({ ...list2, price: e.target.value })}
              />
            </div>
            <button
              onClick={sendList}
              className="w-full rounded-lg py-3 font-semibold text-white"
              style={{ background: c }}
            >
              Send details on WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT / AGENT */}
      <section className="mx-auto max-w-6xl px-3 py-12">
        <div className="grid items-center gap-8 md:grid-cols-[auto,1fr]">
          {d.agentPhoto ? (
            <img
              src={d.agentPhoto}
              alt={d.agent}
              className="mx-auto h-44 w-44 rounded-2xl object-cover"
            />
          ) : (
            <div
              className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl text-5xl font-bold text-white"
              style={{ ...SERIF, background: c }}
            >
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-4xl font-bold" style={{ ...SERIF, color: INK }}>
              {d.agent}
            </h2>
            <div className="text-sm font-semibold" style={{ color: c }}>
              {d.agentRole}
            </div>
            <p className="mt-3 max-w-xl whitespace-pre-line text-slate-600">
              {d.about}
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {d.reviews.map((r, i) => (
            <figure
              key={i}
              className="rounded-xl border-l-4 bg-white p-5 shadow-sm"
              style={{ borderColor: c }}
            >
              <blockquote className="text-slate-700">“{r.text}”</blockquote>
              <figcaption className="mt-2 text-sm font-semibold">
                {r.who}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="scroll-mt-16 bg-white px-3 py-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold" style={{ ...SERIF, color: INK }}>
              Visit our office
            </h2>
            <p className="mt-3 text-slate-600">{d.address}</p>
            <p className="mt-1 text-sm text-slate-500">{d.hours}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={wa("Hi, I want to talk about a property.")}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
              >
                WhatsApp us
              </a>
              <a
                href={"tel:" + d.phone}
                className="rounded-full border px-6 py-3 text-sm font-semibold"
              >
                Call {d.phone}
              </a>
            </div>
          </div>
          {d.address && (
            <iframe
              title="map"
              src={mapEmbed(d.address)}
              loading="lazy"
              className="h-64 w-full rounded-xl border-0"
            />
          )}
        </div>
      </section>

      <section className="bg-slate-900 px-6 py-8 text-center text-white">
        <div className="font-semibold">
          This is a demo website made for you.
        </div>
        <p className="mt-1 text-sm text-slate-300">{OWNER.offer}</p>
        <a
          href={myWa}
          className="mt-3 inline-block rounded bg-emerald-500 px-5 py-2 font-semibold"
        >
          I want this for my business
        </a>
      </section>

      <a
        href={wa("Hi, I saw your properties online.")}
        className="fixed bottom-4 right-4 z-20 rounded-full bg-emerald-500 px-5 py-3 font-bold text-white shadow-lg"
      >
        WhatsApp
      </a>
      {!isShared && (
        <button
          onClick={tryEdit}
          className="fixed bottom-4 left-4 z-20 rounded-full bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900 shadow-lg"
        >
          ✏️ Edit
        </button>
      )}

      {/* DETAIL */}
      {sel &&
        (() => {
          const p = d.properties.find((k) => k.id === sel.id) || sel;
          const imgs = p.imgs || [];
          const am = (p.amenities || "")
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);
          return (
            <div
              className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
              onClick={() => setSel(null)}
            >
              <div
                className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
                  {imgs[pic] ? (
                    <img
                      src={imgs[pic]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <HomeArt color={c} />
                  )}
                  <Badge p={p} />
                  <button
                    onClick={() => setSel(null)}
                    className="absolute right-3 top-3 rounded bg-slate-900 px-3 py-1.5 text-sm text-white"
                  >
                    Close
                  </button>
                </div>
                {imgs.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-2">
                    {imgs.map((m, i) => (
                      <img
                        key={i}
                        src={m}
                        alt=""
                        onClick={() => setPic(i)}
                        className={
                          "h-14 w-20 shrink-0 cursor-pointer rounded object-cover " +
                          (i === pic ? "ring-2" : "opacity-70")
                        }
                        style={{ "--tw-ring-color": c }}
                      />
                    ))}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h3
                        className="text-3xl font-bold leading-tight"
                        style={SERIF}
                      >
                        {p.title}
                      </h3>
                      <div className="text-sm text-slate-500">{p.locality}</div>
                    </div>
                    <div
                      className="text-4xl font-bold"
                      style={{ ...SERIF, color: c }}
                    >
                      {price(p)}
                    </div>
                  </div>
                  <p className="mt-3 text-slate-600">{p.desc}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {p.beds > 0 && <Spec l="Bedrooms" v={p.beds} />}
                    {p.baths > 0 && <Spec l="Bathrooms" v={p.baths} />}
                    <Spec
                      l="Area"
                      v={(+p.area).toLocaleString("en-IN") + " sq ft"}
                    />
                    <Spec l="Facing" v={p.facing} />
                    <Spec l="Furnishing" v={p.furnishing} />
                    <Spec l="Floor" v={p.floor} />
                    <Spec l="Age" v={p.age} />
                    <Spec l="Type" v={p.type} />
                  </div>
                  {am.length > 0 && (
                    <div className="mt-5">
                      <div className="text-sm font-bold">Amenities</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {am.map((a) => (
                          <span
                            key={a}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <iframe
                    title="location"
                    src={mapEmbed(
                      p.locality + " " + d.address.split(",").slice(-1),
                    )}
                    loading="lazy"
                    className="mt-5 h-48 w-full rounded-xl border-0"
                  />

                  {p.mode === "Sale" && p.type !== "Plot" && (
                    <div className="mt-5 grid items-center gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
                      <div className="space-y-2 text-xs font-medium text-slate-600">
                        <div className="text-sm font-bold text-slate-900">
                          Home loan EMI
                        </div>
                        <label className="block">
                          Down payment: {emi.down}% (
                          {full(Math.round((p.price * emi.down) / 100))})
                          <input
                            type="range"
                            min="10"
                            max="80"
                            step="5"
                            className="w-full"
                            value={emi.down}
                            onChange={(e) =>
                              setEmi({ ...emi, down: +e.target.value })
                            }
                          />
                        </label>
                        <label className="block">
                          Loan period: {emi.years} years
                          <input
                            type="range"
                            min="5"
                            max="30"
                            className="w-full"
                            value={emi.years}
                            onChange={(e) =>
                              setEmi({ ...emi, years: +e.target.value })
                            }
                          />
                        </label>
                        <label className="block">
                          Interest: {emi.rate}% a year
                          <input
                            type="range"
                            min="7"
                            max="12"
                            step="0.25"
                            className="w-full"
                            value={emi.rate}
                            onChange={(e) =>
                              setEmi({ ...emi, rate: +e.target.value })
                            }
                          />
                        </label>
                      </div>
                      <div
                        className="rounded-xl p-4 text-center text-white"
                        style={{ background: INK }}
                      >
                        <div className="text-xs text-slate-300">
                          You pay every month
                        </div>
                        <div className="text-4xl font-bold" style={SERIF}>
                          {full(Math.round(emiOf(p.price)))}
                        </div>
                        <div className="text-xs text-slate-400">
                          Estimate only. Final rate depends on your bank.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <a
                      href={ask(p, "visit")}
                      className="rounded-lg py-3 text-center text-sm font-semibold text-white"
                      style={{ background: c }}
                    >
                      Schedule site visit
                    </a>
                    <a
                      href={ask(p, "ask")}
                      className="rounded-lg bg-emerald-600 py-3 text-center text-sm font-semibold text-white"
                    >
                      Ask on WhatsApp
                    </a>
                    <a
                      href={"tel:" + d.phone}
                      className="rounded-lg border bg-white py-3 text-center text-sm font-semibold"
                    >
                      Call now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {askPass && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs space-y-3 rounded-xl bg-white p-5 text-slate-900">
            <h2 className="font-bold">Owner Login</h2>
            <input
              type="password"
              autoFocus
              className={inp}
              placeholder="Password"
              value={passIn}
              onChange={(e) => setPassIn(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkPass()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setAskPass(false)}
                className="flex-1 rounded border py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={checkPass}
                className="flex-1 rounded bg-slate-900 py-2 text-sm text-white"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PANEL */}
      {open && unlocked && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/50"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <aside className="h-full w-full space-y-3 overflow-y-auto bg-white p-4 text-slate-900 sm:w-96">
            <div className="sticky top-0 z-10 -mx-4 -mt-4 flex items-center justify-between bg-white p-4 shadow-sm">
              <h2 className="font-bold">Edit Website</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Done ✓
              </button>
            </div>

            <H>Business</H>
            <input
              className={inp}
              placeholder="Business name"
              value={d.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <input
              className={inp}
              placeholder="Headline"
              value={d.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
            <input
              className={inp}
              placeholder="RERA number (optional)"
              value={d.rera}
              onChange={(e) => set("rera", e.target.value)}
            />
            <textarea
              rows={3}
              className={inp}
              placeholder="About"
              value={d.about}
              onChange={(e) => set("about", e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                className={inp}
                placeholder="Sold"
                value={d.sold}
                onChange={(e) => set("sold", e.target.value)}
              />
              <input
                className={inp}
                placeholder="Families"
                value={d.clients}
                onChange={(e) => set("clients", e.target.value)}
              />
              <input
                className={inp}
                placeholder="Years"
                value={d.years}
                onChange={(e) => set("years", e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="color"
                className="h-10 w-20"
                value={d.color}
                onChange={(e) => set("color", e.target.value)}
              />
              <input
                className={inp}
                placeholder="Currency"
                value={d.currency}
                onChange={(e) => set("currency", e.target.value)}
              />
            </div>

            <H>Contact</H>
            <input
              className={inp}
              placeholder="Phone"
              value={d.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <input
              className={inp}
              placeholder="WhatsApp (91 + number)"
              value={d.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
            />
            <textarea
              rows={2}
              className={inp}
              placeholder="Office address (map appears)"
              value={d.address}
              onChange={(e) => set("address", e.target.value)}
            />
            <input
              className={inp}
              placeholder="Opening hours"
              value={d.hours}
              onChange={(e) => set("hours", e.target.value)}
            />

            <H>Agent / owner</H>
            <input
              className={inp}
              placeholder="Name"
              value={d.agent}
              onChange={(e) => set("agent", e.target.value)}
            />
            <input
              className={inp}
              placeholder="Role"
              value={d.agentRole}
              onChange={(e) => set("agentRole", e.target.value)}
            />
            <ImageInput
              onFile={(f) =>
                readImage(f, 500, "image/jpeg", (x) => set("agentPhoto", x))
              }
            />
            {d.agentPhoto && (
              <button
                className="text-xs text-red-600"
                onClick={() => set("agentPhoto", "")}
              >
                Remove photo
              </button>
            )}

            <H>Top photo (optional)</H>
            <ImageInput
              onFile={(f) =>
                readImage(f, 1400, "image/jpeg", (x) => set("hero", x))
              }
            />
            {d.hero && (
              <button
                className="text-xs text-red-600"
                onClick={() => set("hero", "")}
              >
                Remove top photo
              </button>
            )}

            <H>Properties</H>
            {d.properties.map((p, i) => (
              <div key={p.id} className="space-y-1 rounded border p-2">
                {p.imgs?.length > 0 && (
                  <div className="grid grid-cols-4 gap-1">
                    {p.imgs.map((m, k) => (
                      <div key={k} className="relative">
                        <img
                          src={m}
                          alt=""
                          className="h-14 w-full rounded object-cover"
                        />
                        <button
                          onClick={() =>
                            upP(
                              i,
                              "imgs",
                              p.imgs.filter((_, j) => j !== k),
                            )
                          }
                          className="absolute right-0 top-0 rounded-bl bg-red-600 px-1.5 text-xs text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <ImageInput onFile={(f) => addPhoto(i, f)} />
                <input
                  className={inp}
                  placeholder="Title (e.g. 3 BHK in Prestige Lakeside)"
                  value={p.title}
                  onChange={(e) => upP(i, "title", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-1">
                  <select
                    className={inp}
                    value={p.mode}
                    onChange={(e) => upP(i, "mode", e.target.value)}
                  >
                    <option value="Sale">For sale</option>
                    <option value="Rent">For rent</option>
                  </select>
                  <select
                    className={inp}
                    value={p.type}
                    onChange={(e) => upP(i, "type", e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    className={inp}
                    placeholder="Area / locality"
                    value={p.locality}
                    onChange={(e) => upP(i, "locality", e.target.value)}
                  />
                  <input
                    type="number"
                    className={inp}
                    placeholder={p.mode === "Rent" ? "Rent per month" : "Price"}
                    value={p.price}
                    onChange={(e) => upP(i, "price", +e.target.value)}
                  />
                  <input
                    type="number"
                    className={inp}
                    placeholder="Bedrooms"
                    value={p.beds}
                    onChange={(e) => upP(i, "beds", +e.target.value)}
                  />
                  <input
                    type="number"
                    className={inp}
                    placeholder="Bathrooms"
                    value={p.baths}
                    onChange={(e) => upP(i, "baths", +e.target.value)}
                  />
                  <input
                    type="number"
                    className={inp}
                    placeholder="Area sq ft"
                    value={p.area}
                    onChange={(e) => upP(i, "area", +e.target.value)}
                  />
                  <input
                    className={inp}
                    placeholder="Facing"
                    value={p.facing}
                    onChange={(e) => upP(i, "facing", e.target.value)}
                  />
                  <input
                    className={inp}
                    placeholder="Furnishing"
                    value={p.furnishing}
                    onChange={(e) => upP(i, "furnishing", e.target.value)}
                  />
                  <input
                    className={inp}
                    placeholder="Floor"
                    value={p.floor}
                    onChange={(e) => upP(i, "floor", e.target.value)}
                  />
                </div>
                <input
                  className={inp}
                  placeholder="Age of building"
                  value={p.age}
                  onChange={(e) => upP(i, "age", e.target.value)}
                />
                <textarea
                  rows={2}
                  className={inp}
                  placeholder="Amenities, separated by commas"
                  value={p.amenities}
                  onChange={(e) => upP(i, "amenities", e.target.value)}
                />
                <textarea
                  rows={2}
                  className={inp}
                  placeholder="Description"
                  value={p.desc}
                  onChange={(e) => upP(i, "desc", e.target.value)}
                />
                <select
                  className={inp}
                  value={p.status}
                  onChange={(e) => upP(i, "status", e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold / Rented</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!p.featured}
                    onChange={(e) => upP(i, "featured", e.target.checked)}
                  />{" "}
                  Show as Featured (appears first)
                </label>
                <button
                  className="text-xs text-red-600"
                  onClick={() =>
                    confirm("Delete this property?") &&
                    set(
                      "properties",
                      d.properties.filter((_, j) => j !== i),
                    )
                  }
                >
                  Delete property
                </button>
              </div>
            ))}
            <button
              className="w-full rounded border py-2 text-sm"
              onClick={() =>
                set("properties", [
                  {
                    id: Date.now(),
                    title: "",
                    type: "Apartment",
                    mode: "Sale",
                    locality: "",
                    price: 0,
                    beds: 2,
                    baths: 2,
                    area: 0,
                    facing: "",
                    furnishing: "",
                    floor: "",
                    age: "",
                    amenities: "",
                    desc: "",
                    status: "available",
                    featured: false,
                    imgs: [],
                  },
                  ...d.properties,
                ])
              }
            >
              + Add property
            </button>

            <H>Services</H>
            {d.services.map((s, i) => (
              <div key={i} className="space-y-1 rounded border p-2">
                <input
                  className={inp}
                  placeholder="Service name"
                  value={s.title}
                  onChange={(e) => upS(i, "title", e.target.value)}
                />
                <textarea
                  rows={2}
                  className={inp}
                  placeholder="Short line"
                  value={s.text}
                  onChange={(e) => upS(i, "text", e.target.value)}
                />
                <button
                  className="text-xs text-red-600"
                  onClick={() =>
                    set(
                      "services",
                      d.services.filter((_, j) => j !== i),
                    )
                  }
                >
                  Delete service
                </button>
              </div>
            ))}
            <button
              className="w-full rounded border py-2 text-sm"
              onClick={() =>
                set("services", [...d.services, { title: "", text: "" }])
              }
            >
              + Add service
            </button>
            <textarea
              rows={2}
              className={inp}
              placeholder="Areas you cover, separated by commas"
              value={d.areas}
              onChange={(e) => set("areas", e.target.value)}
            />

            <H>Reviews</H>
            {d.reviews.map((r, i) => (
              <div key={i} className="space-y-1 rounded border p-2">
                <input
                  className={inp}
                  placeholder="Customer name, area"
                  value={r.who}
                  onChange={(e) =>
                    set(
                      "reviews",
                      d.reviews.map((v, j) =>
                        j === i ? { ...v, who: e.target.value } : v,
                      ),
                    )
                  }
                />
                <textarea
                  rows={2}
                  className={inp}
                  placeholder="What they said"
                  value={r.text}
                  onChange={(e) =>
                    set(
                      "reviews",
                      d.reviews.map((v, j) =>
                        j === i ? { ...v, text: e.target.value } : v,
                      ),
                    )
                  }
                />
                <button
                  className="text-xs text-red-600"
                  onClick={() =>
                    set(
                      "reviews",
                      d.reviews.filter((_, j) => j !== i),
                    )
                  }
                >
                  Delete review
                </button>
              </div>
            ))}
            <button
              className="w-full rounded border py-2 text-sm"
              onClick={() =>
                set("reviews", [...d.reviews, { who: "", text: "" }])
              }
            >
              + Add review
            </button>

            <H>Customer links</H>
            <LinkManager app="estate" getData={() => d} />
            <button
              onClick={() => {
                if (confirm("Delete everything and start fresh?")) {
                  localStorage.removeItem("estate-data");
                  location.href = location.pathname;
                }
              }}
              className="w-full rounded border border-red-300 py-2 text-sm text-red-600"
            >
              Reset everything
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
