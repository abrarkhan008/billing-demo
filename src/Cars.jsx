import { useState, useEffect, useMemo } from "react";
import { OWNER } from "./config";
import { carsPresets } from "./presets";
import { LinkManager, ImageInput, readImage } from "./extras";

/* ========== STARTING DETAILS (all editable inside the website) ========== */
const DEFAULT = {
  name: "Your Motors",
  tagline: "Inspected used cars. Fair prices. Clean papers.",
  phone: "9999999999",
  whatsapp: "919999999999",
  address: "Hosur Road, Bengaluru",
  hours: "Mon–Sat 9:30 AM – 8:00 PM, Sun 10 AM – 5 PM",
  color: "#b45309",
  currency: "₹",
  hero: "",
  about:
    "We buy and sell pre-owned cars with a 150-point inspection, verified service history and free RC transfer. Every car you see here is on our lot, ready for a test drive.",
  warranty: "6 months / 6,000 km warranty on every car",
  years: "12",
  sold: "1,800",
  cars: [
    { id: 1, name: "Maruti Swift VXi", brand: "Maruti", year: 2019, km: 38000, fuel: "Petrol", trans: "Manual", owners: 1, price: 465000, colour: "Pearl White", reg: "KA 03", status: "available", note: "Single owner, full service history, new tyres.", imgs: [] },
    { id: 2, name: "Hyundai Creta SX", brand: "Hyundai", year: 2018, km: 61000, fuel: "Diesel", trans: "Manual", owners: 1, price: 925000, colour: "Phantom Black", reg: "KA 01", status: "available", note: "Sunroof, touchscreen, reverse camera.", imgs: [] },
    { id: 3, name: "Honda City ZX", brand: "Honda", year: 2020, km: 29000, fuel: "Petrol", trans: "Automatic", owners: 1, price: 1075000, colour: "Lunar Silver", reg: "KA 51", status: "available", note: "Under company warranty till 2025.", imgs: [] },
    { id: 4, name: "Toyota Innova Crysta", brand: "Toyota", year: 2017, km: 94000, fuel: "Diesel", trans: "Manual", owners: 2, price: 1450000, colour: "Grey", reg: "KA 05", status: "available", note: "7 seater, well maintained, serviced at Toyota.", imgs: [] },
    { id: 5, name: "Tata Nexon XZ+", brand: "Tata", year: 2021, km: 22000, fuel: "Petrol", trans: "Manual", owners: 1, price: 895000, colour: "Flame Red", reg: "KA 04", status: "booked", note: "5-star safety rating, low running.", imgs: [] },
    { id: 6, name: "Mahindra XUV500 W8", brand: "Mahindra", year: 2016, km: 82000, fuel: "Diesel", trans: "Manual", owners: 2, price: 785000, colour: "Black", reg: "KA 02", status: "available", note: "Leather seats, powerful engine.", imgs: [] },
  ],
  reviews: [
    { who: "Rohit, Whitefield", text: "Sold my old i20 in one day and the price was fair. Payment came the same evening." },
    { who: "Meena, Jayanagar", text: "They showed the full service record before I asked. RC transfer was done in a week." },
  ],
};

const slug = location.pathname.split("/")[2];

function load(shared) {
  let d = DEFAULT;
  if (!shared) {
    try {
      const x = JSON.parse(localStorage.getItem("cars-data"));
      if (x) d = { ...DEFAULT, ...x };
    } catch {}
  }
  if (carsPresets[slug]) d = { ...d, ...carsPresets[slug] };
  if (shared) d = { ...d, ...shared };
  return d;
}

const inp = "w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900";
const H = ({ children }) => <h3 className="border-t pt-3 text-sm font-bold text-slate-800">{children}</h3>;
const FUELS = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const INK = "#16191d";
const DISPLAY = { fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" };

/* simple drawn car used when no photo has been added */
function CarArt({ color }) {
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full" style={{ background: color + "1a" }}>
      <ellipse cx="120" cy="96" rx="92" ry="6" fill="#0002" />
      <path d="M26 88 L30 70 Q34 60 50 58 L78 56 Q92 38 112 36 L150 36 Q168 38 180 56 L206 62 Q216 66 216 78 L216 88 Z" fill={color} />
      <path d="M92 56 Q100 44 114 43 L148 43 Q160 45 168 56 Z" fill="#fff" opacity=".75" />
      <circle cx="68" cy="90" r="14" fill={INK} /><circle cx="68" cy="90" r="6" fill="#cbd5e1" />
      <circle cx="170" cy="90" r="14" fill={INK} /><circle cx="170" cy="90" r="6" fill="#cbd5e1" />
    </svg>
  );
}

export default function Cars({ shared }) {
  const [d, setD] = useState(() => load(shared));
  const isShared = !!shared || !!carsPresets[slug];
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("All");
  const [fuel, setFuel] = useState("All");
  const [maxP, setMaxP] = useState(0); // 0 = any
  const [sort, setSort] = useState("new");
  const [sel, setSel] = useState(null);
  const [pic, setPic] = useState(0);
  const [saved, setSaved] = useState([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [emi, setEmi] = useState({ down: 20, years: 4, rate: 9.5 });
  const [sell, setSell] = useState({ name: "", phone: "", car: "", year: "", km: "", price: "" });
  const [open, setOpen] = useState(false);
  const [askPass, setAskPass] = useState(false);
  const [passIn, setPassIn] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(l);
  }, []);

  const c = d.color;
  const save = (n) => {
    setD(n);
    try { localStorage.setItem("cars-data", JSON.stringify(n)); }
    catch { alert("Storage is full. Use fewer or smaller photos."); }
  };
  const set = (k, v) => save({ ...d, [k]: v });
  const upCar = (i, k, v) => set("cars", d.cars.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const addPhoto = (i, f) =>
    readImage(f, 900, "image/jpeg", (x) =>
      setD((old) => {
        const n = { ...old, cars: old.cars.map((car, j) => (j === i ? { ...car, imgs: [...(car.imgs || []), x] } : car)) };
        try { localStorage.setItem("cars-data", JSON.stringify(n)); } catch {}
        return n;
      }),
    );

  /* ---- formatting ---- */
  const lakh = (n) => {
    const v = +n || 0;
    if (v >= 1e7) return `${d.currency}${(v / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
    if (v >= 1e5) return `${d.currency}${(v / 1e5).toFixed(2).replace(/\.?0+$/, "")} Lakh`;
    return d.currency + v.toLocaleString("en-IN");
  };
  const full = (n) => d.currency + (+n || 0).toLocaleString("en-IN");
  const km = (n) => (+n || 0).toLocaleString("en-IN") + " km";
  const emiOf = (price) => {
    const P = price * (1 - emi.down / 100), r = emi.rate / 1200, n = emi.years * 12;
    return r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  /* ---- filtering ---- */
  const brands = ["All", ...new Set(d.cars.map((x) => x.brand).filter(Boolean))];
  const maxPrice = Math.max(...d.cars.map((x) => +x.price || 0), 100000);
  const list = useMemo(() => {
    let r = d.cars.filter(
      (x) =>
        (brand === "All" || x.brand === brand) &&
        (fuel === "All" || x.fuel === fuel) &&
        (!maxP || x.price <= maxP) &&
        (!onlySaved || saved.includes(x.id)) &&
        (x.name + " " + x.brand).toLowerCase().includes(q.toLowerCase()),
    );
    const s = { new: (a, b) => b.year - a.year, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, km: (a, b) => a.km - b.km };
    return r.sort(s[sort]);
  }, [d.cars, brand, fuel, maxP, q, sort, onlySaved, saved]);

  const wa = (msg, to = d.whatsapp) => `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
  const enquire = (x, kind) =>
    wa(kind === "drive"
      ? `Hi, I'd like to book a test drive for the ${x.year} ${x.name} (${full(x.price)}). When can I come?`
      : `Hi, I'm interested in the ${x.year} ${x.name} (${full(x.price)}, ${km(x.km)}). Is it still available?`);
  const sendSell = () => {
    if (!sell.car || !sell.phone) return alert("Please enter your car model and phone number");
    window.open(
      wa(`I want to sell my car.\nName: ${sell.name || "-"}\nPhone: ${sell.phone}\nCar: ${sell.car}\nYear: ${sell.year || "-"}\nKm driven: ${sell.km || "-"}\nExpected price: ${sell.price || "-"}`),
      "_blank",
    );
  };
  const toggleSave = (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const tryEdit = () => (unlocked ? setOpen(true) : (setPassIn(""), setAskPass(true)));
  const checkPass = () => {
    if (passIn === OWNER.password) { setUnlocked(true); setAskPass(false); setOpen(true); }
    else alert("Wrong password");
  };
  const myWa = wa(OWNER.message, OWNER.whatsapp);
  const mapEmbed = d.address ? `https://www.google.com/maps?q=${encodeURIComponent(d.address)}&output=embed` : "";
  const availableCount = d.cars.filter((x) => x.status === "available").length;

  const Badge = ({ x }) =>
    x.status === "sold" ? <span className="absolute left-3 top-3 rounded bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">SOLD</span>
    : x.status === "booked" ? <span className="absolute left-3 top-3 rounded bg-amber-400 px-2.5 py-1 text-xs font-bold text-slate-900">BOOKED</span>
    : <span className="absolute left-3 top-3 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">{x.owners === 1 ? "1st owner" : x.owners + " owners"}</span>;

  const Spec = ({ l, v }) => (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-[11px] text-slate-500">{l}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-900">{v || "—"}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f5f6] text-slate-800" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* NAV */}
      <header className="sticky top-0 z-20 text-white shadow-lg" style={{ background: INK }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-2xl font-extrabold uppercase leading-none tracking-wide" style={DISPLAY}>{d.name}</div>
          </div>
          <nav className="hidden gap-5 text-sm text-slate-300 sm:flex">
            <a href="#cars" className="hover:text-white">Buy a car</a>
            <a href="#sell" className="hover:text-white">Sell your car</a>
            <a href="#visit" className="hover:text-white">Visit us</a>
          </nav>
          <a href={"tel:" + d.phone} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: c }}>Call {d.phone}</a>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative text-white"
        style={{ background: d.hero ? `url(${d.hero}) center/cover` : `linear-gradient(115deg, ${INK} 35%, ${c} 150%)` }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,12,14,.88), rgba(10,12,14,.35))" }} />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-14 sm:pt-20">
          <h1 className="max-w-2xl text-5xl font-extrabold uppercase leading-[0.95] sm:text-7xl" style={DISPLAY}>{d.tagline}</h1>
          <p className="mt-4 max-w-lg text-slate-300">{d.warranty}. Free RC transfer, easy finance and instant cash when you sell.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#cars" className="rounded-full px-7 py-3 font-semibold text-white" style={{ background: c }}>Browse {availableCount} cars</a>
            <a href="#sell" className="rounded-full border border-white/60 px-7 py-3 font-semibold">Get a price for my car</a>
          </div>
        </div>
      </section>

      {/* SEARCH BAR overlapping hero */}
      <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-3">
        <div className="grid gap-2 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 sm:grid-cols-5">
          <input className={inp + " sm:col-span-2"} placeholder="Search make or model" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inp} value={brand} onChange={(e) => setBrand(e.target.value)}>
            {brands.map((b) => <option key={b} value={b}>{b === "All" ? "All brands" : b}</option>)}
          </select>
          <select className={inp} value={fuel} onChange={(e) => setFuel(e.target.value)}>
            {["All", ...FUELS].map((f) => <option key={f} value={f}>{f === "All" ? "Any fuel" : f}</option>)}
          </select>
          <select className={inp} value={maxP} onChange={(e) => setMaxP(+e.target.value)}>
            <option value={0}>Any budget</option>
            {[300000, 500000, 800000, 1200000, 2000000].filter((v) => v < maxPrice * 2).map((v) => (
              <option key={v} value={v}>Under {lakh(v)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TRUST NUMBERS */}
      <section className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-3 px-3 sm:grid-cols-4">
        {[
          [d.sold + "+", "cars sold"],
          [d.years + " years", "in business"],
          ["150 points", "checked on every car"],
          ["Free", "RC transfer & insurance help"],
        ].map(([a, b]) => (
          <div key={b} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            <div className="text-3xl font-bold leading-none" style={{ ...DISPLAY, color: c }}>{a}</div>
            <div className="mt-1 text-xs text-slate-500">{b}</div>
          </div>
        ))}
      </section>

      {/* INVENTORY */}
      <section id="cars" className="mx-auto max-w-6xl scroll-mt-16 px-3 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-4xl font-bold uppercase" style={{ ...DISPLAY, color: INK }}>Cars on our lot ({list.length})</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setOnlySaved(!onlySaved)} className="rounded-full px-4 py-2 text-xs font-semibold" style={onlySaved ? { background: c, color: "#fff" } : { background: "#fff", boxShadow: "0 0 0 1px #e2e8f0" }}>
              ♥ Saved ({saved.length})
            </button>
            <select className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">Newest first</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="km">Least driven</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((x) => (
            <article key={x.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-lg">
              <button className="relative block aspect-[16/10] w-full overflow-hidden text-left" onClick={() => { setSel(x); setPic(0); }}>
                {x.imgs?.[0] ? <img src={x.imgs[0]} alt={x.name} loading="lazy" className={"h-full w-full object-cover " + (x.status === "sold" ? "grayscale" : "")} /> : <CarArt color={c} />}
                <Badge x={x} />
              </button>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold leading-tight" style={DISPLAY}>{x.year} {x.name}</h3>
                    <div className="mt-0.5 text-xs text-slate-500">{x.colour} · {x.reg}</div>
                  </div>
                  <button onClick={() => toggleSave(x.id)} aria-label="Save" className="text-xl" style={{ color: saved.includes(x.id) ? "#dc2626" : "#cbd5e1" }}>♥</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  {[km(x.km), x.fuel, x.trans].map((t) => <span key={t} className="rounded bg-slate-100 px-2 py-1 text-slate-700">{t}</span>)}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold leading-none" style={{ ...DISPLAY, color: c }}>{lakh(x.price)}</div>
                    <div className="mt-1 text-xs text-slate-500">EMI from {full(Math.round(emiOf(x.price) / 100) * 100)}/month</div>
                  </div>
                  <button onClick={() => { setSel(x); setPic(0); }} className="rounded-full px-5 py-2 text-sm font-semibold text-white" style={{ background: INK }}>View details</button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {list.length === 0 && <div className="rounded-xl bg-white p-10 text-center text-slate-500">No cars match these filters. Try a higher budget or message us — we can find it for you.</div>}
      </section>

      {/* SELL */}
      <section id="sell" className="scroll-mt-16 text-white" style={{ background: INK }}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold uppercase sm:text-5xl" style={DISPLAY}>Sell your car in one day</h2>
            <p className="mt-3 max-w-md text-slate-300">Tell us about your car. We check it, make an offer you can accept on the spot, and pay the same day. We handle all the paperwork.</p>
            <ol className="mt-6 space-y-3 text-sm">
              {["Send your car details here", "We inspect it at your home or our lot", "Get a fair offer and decide", "Money in your account, papers done by us"].map((t, i) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: c }}>{i + 1}</span>{t}
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-2 rounded-2xl bg-white p-4 text-slate-900">
            <div className="grid grid-cols-2 gap-2">
              <input className={inp} placeholder="Your name" value={sell.name} onChange={(e) => setSell({ ...sell, name: e.target.value })} />
              <input className={inp} inputMode="tel" placeholder="Phone number" value={sell.phone} onChange={(e) => setSell({ ...sell, phone: e.target.value })} />
            </div>
            <input className={inp} placeholder="Car make and model (e.g. Honda Amaze VX)" value={sell.car} onChange={(e) => setSell({ ...sell, car: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className={inp} inputMode="numeric" placeholder="Year" value={sell.year} onChange={(e) => setSell({ ...sell, year: e.target.value })} />
              <input className={inp} inputMode="numeric" placeholder="Km driven" value={sell.km} onChange={(e) => setSell({ ...sell, km: e.target.value })} />
              <input className={inp} inputMode="numeric" placeholder="Expected price" value={sell.price} onChange={(e) => setSell({ ...sell, price: e.target.value })} />
            </div>
            <button onClick={sendSell} className="w-full rounded-lg py-3 font-semibold text-white" style={{ background: c }}>Get my offer on WhatsApp</button>
            <p className="text-center text-xs text-slate-500">No fee. No obligation to sell.</p>
          </div>
        </div>
      </section>

      {/* ABOUT + PROMISES */}
      <section className="mx-auto max-w-6xl px-3 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold uppercase" style={{ ...DISPLAY, color: INK }}>Why buy from us</h2>
            <p className="mt-3 whitespace-pre-line text-slate-600">{d.about}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Inspected", "150-point check by our mechanics before any car is listed."],
              ["Clean papers", "RC, insurance and loan clearance verified. Free transfer."],
              ["Easy finance", "Loans up to 90% of the price, approved in a day."],
              ["Warranty", d.warranty + "."],
            ].map(([t, x]) => (
              <div key={t} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <div className="font-bold" style={{ color: c }}>{t}</div>
                <p className="mt-1 text-sm text-slate-600">{x}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {d.reviews.map((r, i) => (
            <figure key={i} className="rounded-xl border-l-4 bg-white p-5 shadow-sm" style={{ borderColor: c }}>
              <blockquote className="text-slate-700">“{r.text}”</blockquote>
              <figcaption className="mt-2 text-sm font-semibold">{r.who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* VISIT */}
      <section id="visit" className="scroll-mt-16 bg-white px-3 py-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold uppercase" style={{ ...DISPLAY, color: INK }}>Visit the showroom</h2>
            <p className="mt-3 text-slate-600">{d.address}</p>
            <p className="mt-1 text-sm text-slate-500">{d.hours}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={wa("Hi, I want to visit your showroom.")} className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white">WhatsApp us</a>
              <a href={"tel:" + d.phone} className="rounded-full border px-6 py-3 text-sm font-semibold">Call {d.phone}</a>
              {d.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}`} target="_blank" rel="noreferrer" className="rounded-full border px-6 py-3 text-sm font-semibold">Get directions</a>}
            </div>
          </div>
          {mapEmbed && <iframe title="map" src={mapEmbed} loading="lazy" className="h-64 w-full rounded-xl border-0" />}
        </div>
      </section>

      {/* PITCH */}
      <section className="bg-slate-900 px-6 py-8 text-center text-white">
        <div className="font-semibold">This is a demo website made for you.</div>
        <p className="mt-1 text-sm text-slate-300">{OWNER.offer}</p>
        <a href={myWa} className="mt-3 inline-block rounded bg-emerald-500 px-5 py-2 font-semibold">I want this for my showroom</a>
      </section>

      <a href={wa("Hi, I saw your cars online.")} className="fixed bottom-4 right-4 z-20 rounded-full bg-emerald-500 px-5 py-3 font-bold text-white shadow-lg">WhatsApp</a>
      {!isShared && (
        <button onClick={tryEdit} className="fixed bottom-4 left-4 z-20 rounded-full bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900 shadow-lg">✏️ Edit</button>
      )}

      {/* DETAIL MODAL */}
      {sel && (() => {
        const x = d.cars.find((k) => k.id === sel.id) || sel;
        const imgs = x.imgs || [];
        const price = +x.price || 0;
        return (
          <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={() => setSel(null)}>
            <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="grid md:grid-cols-2">
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {imgs[pic] ? <img src={imgs[pic]} alt="" className="h-full w-full object-cover" /> : <CarArt color={c} />}
                    <Badge x={x} />
                  </div>
                  {imgs.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-2">
                      {imgs.map((m, i) => <img key={i} src={m} alt="" onClick={() => setPic(i)} className={"h-14 w-20 shrink-0 cursor-pointer rounded object-cover " + (i === pic ? "ring-2" : "opacity-70")} style={{ "--tw-ring-color": c }} />)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-3xl font-bold leading-tight" style={DISPLAY}>{x.year} {x.name}</h3>
                    <button onClick={() => setSel(null)} className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">Close</button>
                  </div>
                  <div className="mt-1 text-3xl font-bold" style={{ ...DISPLAY, color: c }}>{full(price)}</div>
                  <p className="mt-2 text-sm text-slate-600">{x.note}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Spec l="Driven" v={km(x.km)} /><Spec l="Fuel" v={x.fuel} /><Spec l="Gearbox" v={x.trans} />
                    <Spec l="Owners" v={x.owners} /><Spec l="Colour" v={x.colour} /><Spec l="Registration" v={x.reg} />
                  </div>
                </div>
              </div>

              {/* EMI */}
              <div className="border-t bg-slate-50 p-5">
                <div className="grid items-center gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-xs font-medium text-slate-600">
                    <div className="text-sm font-bold text-slate-900">EMI calculator</div>
                    <label className="block">Down payment: {emi.down}% ({full(Math.round(price * emi.down / 100))})
                      <input type="range" min="0" max="80" step="5" className="w-full" value={emi.down} onChange={(e) => setEmi({ ...emi, down: +e.target.value })} /></label>
                    <label className="block">Loan period: {emi.years} years
                      <input type="range" min="1" max="7" className="w-full" value={emi.years} onChange={(e) => setEmi({ ...emi, years: +e.target.value })} /></label>
                    <label className="block">Interest: {emi.rate}% a year
                      <input type="range" min="7" max="16" step="0.5" className="w-full" value={emi.rate} onChange={(e) => setEmi({ ...emi, rate: +e.target.value })} /></label>
                  </div>
                  <div className="rounded-xl p-4 text-center text-white" style={{ background: INK }}>
                    <div className="text-xs text-slate-300">You pay every month</div>
                    <div className="text-4xl font-bold" style={DISPLAY}>{full(Math.round(emiOf(price)))}</div>
                    <div className="text-xs text-slate-400">Estimate only. Final rate depends on your bank.</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <a href={enquire(x, "ask")} className="rounded-lg bg-emerald-600 py-3 text-center text-sm font-semibold text-white">Ask on WhatsApp</a>
                  <a href={enquire(x, "drive")} className="rounded-lg py-3 text-center text-sm font-semibold text-white" style={{ background: c }}>Book test drive</a>
                  <a href={"tel:" + d.phone} className="rounded-lg border bg-white py-3 text-center text-sm font-semibold">Call now</a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PASSWORD */}
      {askPass && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs space-y-3 rounded-xl bg-white p-5 text-slate-900">
            <h2 className="font-bold">Owner Login</h2>
            <input type="password" autoFocus className={inp} placeholder="Password" value={passIn} onChange={(e) => setPassIn(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkPass()} />
            <div className="flex gap-2">
              <button onClick={() => setAskPass(false)} className="flex-1 rounded border py-2 text-sm">Cancel</button>
              <button onClick={checkPass} className="flex-1 rounded bg-slate-900 py-2 text-sm text-white">Open</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PANEL */}
      {open && unlocked && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/50" style={{ fontFamily: "system-ui, sans-serif" }}>
          <aside className="h-full w-full space-y-3 overflow-y-auto bg-white p-4 text-slate-900 sm:w-96">
            <div className="sticky top-0 z-10 -mx-4 -mt-4 flex items-center justify-between bg-white p-4 shadow-sm">
              <h2 className="font-bold">Edit Showroom</h2>
              <button onClick={() => setOpen(false)} className="rounded bg-slate-900 px-4 py-2 text-sm text-white">Done ✓</button>
            </div>

            <H>Showroom</H>
            <input className={inp} placeholder="Showroom name" value={d.name} onChange={(e) => set("name", e.target.value)} />
            <input className={inp} placeholder="Headline" value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
            <textarea rows={3} className={inp} placeholder="About" value={d.about} onChange={(e) => set("about", e.target.value)} />
            <input className={inp} placeholder="Warranty line" value={d.warranty} onChange={(e) => set("warranty", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inp} placeholder="Years in business" value={d.years} onChange={(e) => set("years", e.target.value)} />
              <input className={inp} placeholder="Cars sold" value={d.sold} onChange={(e) => set("sold", e.target.value)} />
            </div>
            <div className="flex gap-2">
              <input type="color" className="h-10 w-20" value={d.color} onChange={(e) => set("color", e.target.value)} />
              <input className={inp} placeholder="Currency" value={d.currency} onChange={(e) => set("currency", e.target.value)} />
            </div>

            <H>Contact</H>
            <input className={inp} placeholder="Phone" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
            <input className={inp} placeholder="WhatsApp (91 + number)" value={d.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            <textarea rows={2} className={inp} placeholder="Address (map appears)" value={d.address} onChange={(e) => set("address", e.target.value)} />
            <input className={inp} placeholder="Opening hours" value={d.hours} onChange={(e) => set("hours", e.target.value)} />

            <H>Top photo (optional)</H>
            <ImageInput onFile={(f) => readImage(f, 1400, "image/jpeg", (x) => set("hero", x))} />
            {d.hero && <button className="text-xs text-red-600" onClick={() => set("hero", "")}>Remove top photo</button>}

            <H>Cars</H>
            {d.cars.map((x, i) => (
              <div key={x.id} className="space-y-1 rounded border p-2">
                {x.imgs?.length > 0 && (
                  <div className="grid grid-cols-4 gap-1">
                    {x.imgs.map((m, k) => (
                      <div key={k} className="relative">
                        <img src={m} alt="" className="h-14 w-full rounded object-cover" />
                        <button onClick={() => upCar(i, "imgs", x.imgs.filter((_, j) => j !== k))} className="absolute right-0 top-0 rounded-bl bg-red-600 px-1.5 text-xs text-white">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <ImageInput onFile={(f) => addPhoto(i, f)} />
                <input className={inp} placeholder="Car name (e.g. Maruti Swift VXi)" value={x.name} onChange={(e) => upCar(i, "name", e.target.value)} />
                <div className="grid grid-cols-2 gap-1">
                  <input className={inp} placeholder="Brand" value={x.brand} onChange={(e) => upCar(i, "brand", e.target.value)} />
                  <input type="number" className={inp} placeholder="Year" value={x.year} onChange={(e) => upCar(i, "year", +e.target.value)} />
                  <input type="number" className={inp} placeholder="Price" value={x.price} onChange={(e) => upCar(i, "price", +e.target.value)} />
                  <input type="number" className={inp} placeholder="Km driven" value={x.km} onChange={(e) => upCar(i, "km", +e.target.value)} />
                  <select className={inp} value={x.fuel} onChange={(e) => upCar(i, "fuel", e.target.value)}>{FUELS.map((f) => <option key={f}>{f}</option>)}</select>
                  <select className={inp} value={x.trans} onChange={(e) => upCar(i, "trans", e.target.value)}><option>Manual</option><option>Automatic</option></select>
                  <input type="number" className={inp} placeholder="Owners" value={x.owners} onChange={(e) => upCar(i, "owners", +e.target.value)} />
                  <input className={inp} placeholder="Colour" value={x.colour} onChange={(e) => upCar(i, "colour", e.target.value)} />
                </div>
                <input className={inp} placeholder="Registration (e.g. KA 03)" value={x.reg} onChange={(e) => upCar(i, "reg", e.target.value)} />
                <textarea rows={2} className={inp} placeholder="Notes about this car" value={x.note} onChange={(e) => upCar(i, "note", e.target.value)} />
                <select className={inp} value={x.status} onChange={(e) => upCar(i, "status", e.target.value)}>
                  <option value="available">Available</option><option value="booked">Booked</option><option value="sold">Sold</option>
                </select>
                <button className="text-xs text-red-600" onClick={() => confirm("Delete this car?") && set("cars", d.cars.filter((_, j) => j !== i))}>Delete car</button>
              </div>
            ))}
            <button className="w-full rounded border py-2 text-sm" onClick={() => set("cars", [{ id: Date.now(), name: "", brand: "", year: new Date().getFullYear(), km: 0, fuel: "Petrol", trans: "Manual", owners: 1, price: 0, colour: "", reg: "", status: "available", note: "", imgs: [] }, ...d.cars])}>+ Add car</button>

            <H>Reviews</H>
            {d.reviews.map((r, i) => (
              <div key={i} className="space-y-1 rounded border p-2">
                <input className={inp} placeholder="Customer name, area" value={r.who} onChange={(e) => set("reviews", d.reviews.map((v, j) => (j === i ? { ...v, who: e.target.value } : v)))} />
                <textarea rows={2} className={inp} placeholder="What they said" value={r.text} onChange={(e) => set("reviews", d.reviews.map((v, j) => (j === i ? { ...v, text: e.target.value } : v)))} />
                <button className="text-xs text-red-600" onClick={() => set("reviews", d.reviews.filter((_, j) => j !== i))}>Delete review</button>
              </div>
            ))}
            <button className="w-full rounded border py-2 text-sm" onClick={() => set("reviews", [...d.reviews, { who: "", text: "" }])}>+ Add review</button>

            <H>Customer links</H>
            <LinkManager app="cars" getData={() => d} />
            <button
              onClick={() => { if (confirm("Delete everything and start fresh?")) { localStorage.removeItem("cars-data"); location.href = location.pathname; } }}
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