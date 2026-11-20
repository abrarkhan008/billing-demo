import { useState } from "react";
import { OWNER } from "./config";
import { sitePresets } from "./presets";
import {
  createShare,
  LinkManager,
  ImageInput,
  readImage as readImg,
} from "./extras";

const DEFAULT = {
  name: "Your Business Name",
  tagline: "Mehendi & Makeup Artist",
  phone: "9999999999",
  whatsapp: "919999999999",
  insta: "",
  address: "",
  color: "#9d174d",
  about:
    "Write about your work here. Years of experience, areas you serve, special styles.",
  hero: "",
  niche: "mehendi",
  stats: "500+|Happy clients\n8 yrs|Experience\n4.9★|Average rating",
  gallery: [],
  services: [
    { title: "Bridal", price: "₹3,000 onwards", text: "Full hands + legs" },
    { title: "Arabic", price: "₹500 onwards", text: "Quick and elegant" },
    { title: "Party", price: "₹300 onwards", text: "Festival and functions" },
  ],
  steps:
    "Choose your design from the gallery\nMessage us on WhatsApp with your date\nWe confirm your booking\nEnjoy your beautiful look",
  reviews: [
    { who: "Anita", text: "Very neat work and on time!" },
    { who: "Sneha", text: "Everyone loved it." },
  ],
};
const NICHES = {
  mehendi: {
    label: "Mehendi",
    emoji: "🌸",
    color: "#9d174d",
    tagline: "Mehendi & Makeup Artist",
    about:
      "Intricate bridal and party mehendi, crafted with natural henna and years of care.",
    stats: "500+|Brides served\n8 yrs|Experience\n4.9★|Average rating",
    services: [
      { title: "Bridal", price: "₹3,000 onwards", text: "Full hands + legs" },
      { title: "Arabic", price: "₹500 onwards", text: "Quick and elegant" },
      { title: "Party", price: "₹300 onwards", text: "Festival and functions" },
    ],
    steps:
      "Choose a design from the portfolio\nMessage us with your date\nWe confirm your booking\nEnjoy your look",
    reviews: [
      { who: "Anita", text: "Very neat work and on time." },
      { who: "Sneha", text: "Everyone loved it." },
    ],
  },
  salon: {
    label: "Salon",
    emoji: "💇",
    color: "#a16207",
    tagline: "Unisex Salon & Spa",
    about:
      "Hair, skin and grooming by trained stylists in a calm, hygienic studio.",
    stats: "3,000+|Happy guests\n12|Expert stylists\n4.8★|Google rating",
    services: [
      {
        title: "Haircut & Styling",
        price: "₹400 onwards",
        text: "Consultation included",
      },
      {
        title: "Facial & Cleanup",
        price: "₹800 onwards",
        text: "Skin-type specific",
      },
      {
        title: "Bridal Package",
        price: "₹15,000 onwards",
        text: "Trial included",
      },
    ],
    steps:
      "Pick a service\nBook your slot on WhatsApp\nVisit the studio\nWalk out glowing",
    reviews: [
      { who: "Priya", text: "Best haircut I have had in years." },
      { who: "Rahul", text: "Clean, calm and on time." },
    ],
  },
  clinic: {
    label: "Clinic",
    emoji: "🩺",
    color: "#0f766e",
    tagline: "Family & Dental Clinic",
    about:
      "Caring, evidence-based treatment with transparent pricing and short waiting times.",
    stats: "10,000+|Patients treated\n15 yrs|Experience\n4.9★|Patient rating",
    services: [
      {
        title: "Consultation",
        price: "₹300",
        text: "Includes follow-up for 7 days",
      },
      {
        title: "Dental Cleaning",
        price: "₹800",
        text: "Scaling and polishing",
      },
      {
        title: "Health Check",
        price: "₹1,500",
        text: "Basic blood tests included",
      },
    ],
    steps:
      "Book an appointment\nGet a confirmation message\nVisit the clinic\nFollow-up care",
    reviews: [
      { who: "Meena", text: "Doctor explained everything patiently." },
      { who: "Kiran", text: "No long waiting. Very clean clinic." },
    ],
  },
  gym: {
    label: "Gym",
    emoji: "🏋️",
    color: "#b91c1c",
    tagline: "Strength & Fitness Studio",
    about:
      "Personal coaching, modern equipment and a community that keeps you showing up.",
    stats: "800+|Active members\n6|Certified trainers\n24/7|Open access",
    services: [
      { title: "Monthly", price: "₹1,500", text: "Full gym access" },
      { title: "Quarterly", price: "₹3,900", text: "Free diet plan" },
      {
        title: "Personal Training",
        price: "₹6,000 / month",
        text: "One-to-one coaching",
      },
    ],
    steps: "Book a free trial\nBody assessment\nGet your plan\nTrain and track",
    reviews: [
      { who: "Arjun", text: "Lost 12 kg in four months." },
      { who: "Divya", text: "Trainers actually care." },
    ],
  },
  interior: {
    label: "Interiors",
    emoji: "🛋️",
    color: "#44403c",
    tagline: "Interior Design & Fit-outs",
    about:
      "Homes and offices designed around how you live, delivered on a fixed timeline.",
    stats:
      "250+|Projects delivered\n10 yrs|Experience\n45 days|Average handover",
    services: [
      {
        title: "Modular Kitchen",
        price: "₹1,10,000 onwards",
        text: "Design, supply, install",
      },
      {
        title: "Full Home",
        price: "₹1,200 / sq ft",
        text: "Turnkey with warranty",
      },
      {
        title: "Office Fit-out",
        price: "₹900 / sq ft",
        text: "Minimal downtime",
      },
    ],
    steps:
      "Free site visit\n3D design and quote\nExecution with weekly updates\nHandover and warranty",
    reviews: [
      { who: "Nikhil", text: "Delivered on the promised date." },
      { who: "Shweta", text: "Exactly what the 3D showed." },
    ],
  },
  photo: {
    label: "Photographer",
    emoji: "📸",
    color: "#1e293b",
    tagline: "Wedding & Portrait Photography",
    about: "Honest, cinematic storytelling for weddings, families and brands.",
    stats: "300+|Events covered\n9 yrs|Experience\n48 hrs|Preview delivery",
    services: [
      {
        title: "Wedding",
        price: "₹60,000 onwards",
        text: "Two photographers, full day",
      },
      {
        title: "Pre-wedding",
        price: "₹15,000 onwards",
        text: "Outdoor, 4 hours",
      },
      { title: "Portrait", price: "₹3,000", text: "Studio or outdoor" },
    ],
    steps: "Share your date\nPick a package\nShoot day\nGet edited gallery",
    reviews: [
      { who: "Asha", text: "Every frame felt like us." },
      { who: "Vivek", text: "Quick delivery and great edits." },
    ],
  },
};
const slug = location.pathname.split("/")[2];

function load(shared) {
  let d = DEFAULT;
  if (!shared) {
    try {
      const x = JSON.parse(localStorage.getItem("site-data"));
      if (x) d = { ...DEFAULT, ...x };
    } catch {}
  }
  if (sitePresets[slug]) d = { ...d, ...sitePresets[slug] };
  try {
    const q = new URLSearchParams(location.search).get("d");
    if (q) d = { ...d, ...JSON.parse(decodeURIComponent(escape(atob(q)))) };
  } catch {}
  if (shared) d = { ...d, ...shared };
  return d;
}

const inp =
  "w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900";
const Field = ({ label, children }) => (
  <div className="block text-xs font-medium text-slate-600">
    {label}
    <div className="mt-1">{children}</div>
  </div>
);
const H = ({ children }) => (
  <h3 className="border-t pt-3 text-sm font-bold text-slate-800">{children}</h3>
);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@300;400;500;600&display=swap');
.sx{font-family:'Jost',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.sx .serif{font-family:'Cormorant Garamond',Georgia,serif}
.sx-rise{animation:sxr .9s cubic-bezier(.2,.7,.2,1) both}
@keyframes sxr{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.sx-cols{column-count:2;column-gap:10px}
@media(min-width:768px){.sx-cols{column-count:3;column-gap:14px}}
.sx-cols img{break-inside:avoid;margin-bottom:10px;width:100%;display:block;cursor:zoom-in}
.sx html{scroll-behavior:smooth}
@media(prefers-reduced-motion:reduce){.sx-rise{animation:none}}
`;

export default function Site({ shared }) {
  const [d, setD] = useState(() => load(shared));
  const isShared =
    !!shared ||
    new URLSearchParams(location.search).has("d") ||
    !!sitePresets[slug];
  const [big, setBig] = useState(null);
  const [open, setOpen] = useState(false);
  const [askPass, setAskPass] = useState(false);
  const [passIn, setPassIn] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const save = (n) => {
    setD(n);
    try {
      localStorage.setItem("site-data", JSON.stringify(n));
    } catch {
      alert("Phone storage is full. Remove some photos.");
    }
  };
  const set = (k, v) => save({ ...d, [k]: v });
  const applyNiche = (k) => {
    const n = NICHES[k];
    save({
      ...d,
      niche: k,
      color: n.color,
      tagline: n.tagline,
      about: n.about,
      stats: n.stats,
      services: n.services,
      steps: n.steps,
      reviews: n.reviews,
    });
  };
  const stats = (d.stats || "")
    .split("\n")
    .filter(Boolean)
    .map((x) => x.split("|"));
  const emoji = NICHES[d.niche]?.emoji || "✨";
  const upList = (key, i, f, v) =>
    set(
      key,
      d[key].map((x, j) => (j === i ? { ...x, [f]: v } : x)),
    );

  const c = d.color;
  const ink = "#1c1917";
  const wa = `https://wa.me/${d.whatsapp}?text=${encodeURIComponent("Hi, I want to book from your website.")}`;
  const myWa = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(OWNER.message)}`;
  const instaUrl = d.insta
    ? "https://instagram.com/" +
      d.insta.replace(/^@/, "").replace(/.*instagram\.com\//, "")
    : "";
  const mapEmbed = d.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(d.address)}&output=embed`
    : "";
  const mapOpen = d.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}`
    : "";
  const steps = d.steps.split("\n").filter(Boolean);

  const tryEdit = () => {
    if (unlocked) setOpen(true);
    else {
      setPassIn("");
      setAskPass(true);
    }
  };
  const checkPass = () => {
    if (passIn === OWNER.password) {
      setUnlocked(true);
      setAskPass(false);
      setOpen(true);
    } else alert("Wrong password");
  };
  const addGallery = (f) =>
    readImg(f, 900, "image/jpeg", (x) =>
      setD((old) => {
        const n = { ...old, gallery: [...old.gallery, x] };
        try {
          localStorage.setItem("site-data", JSON.stringify(n));
        } catch {}
        return n;
      }),
    );
  const copyLink = async () => {
    try {
      const url = await createShare("site", "Customer", d);
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
      alert("Short link copied!\n\n" + url);
    } catch {
      alert("Could not create link. Check Supabase keys in extras.jsx");
    }
  };

  const Title = ({ children, sub }) => (
    <div className="mb-10 text-center">
      <h2
        className="serif text-4xl font-semibold leading-none sm:text-5xl"
        style={{ color: ink }}
      >
        {children}
      </h2>
      <div className="mx-auto mt-4 h-px w-14" style={{ background: c }} />
      {sub && <p className="mt-4 text-sm font-light text-stone-500">{sub}</p>}
    </div>
  );

  const initial = (d.name || "?").trim()[0];

  return (
    <div className="sx min-h-screen bg-[#faf8f5] text-stone-800">
      <style>{CSS}</style>
      {!isShared && (
        <div className="fixed inset-x-0 top-12 z-30 flex gap-2 overflow-x-auto px-3 py-2">
          {Object.entries(NICHES).map(([k, n]) => (
            <button
              key={k}
              onClick={() => applyNiche(k)}
              className={
                "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur " +
                (d.niche === k
                  ? "bg-white text-slate-900"
                  : "bg-black/40 text-white")
              }
            >
              {n.emoji} {n.label}
            </button>
          ))}
        </div>
      )}

      {/* NAV */}
      <nav
        className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3 text-white sm:px-8"
        style={{ background: "linear-gradient(rgba(0,0,0,.45),transparent)" }}
      >
        <a
          href="/"
          className="rounded-full border border-white/30 px-3 py-1 text-xs backdrop-blur"
        >
          ← Hub
        </a>
        <div className="hidden gap-7 text-sm font-light tracking-wide sm:flex">
          <a href="#services">Services</a>
          <a href="#work">Portfolio</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </div>
        <a
          href={wa}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold"
          style={{ color: c }}
        >
          Book now
        </a>
      </nav>

      {/* HERO */}
      <header
        className="relative flex min-h-[100svh] items-end bg-cover bg-center text-white"
        style={{
          backgroundImage: d.hero
            ? `url(${d.hero})`
            : `radial-gradient(120% 90% at 20% 10%, ${c}, #0c0a09 75%)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(12,10,9,.88) 5%, rgba(12,10,9,.25) 55%, rgba(12,10,9,.35))",
          }}
        />
        {!d.hero && (
          <div className="serif pointer-events-none absolute right-[-4%] top-[14%] select-none text-[46vw] font-bold leading-none opacity-[.07]">
            {initial}
          </div>
        )}
        <div className="sx-rise relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 sm:pb-20">
          <p className="mb-4 text-sm font-light tracking-[.18em] text-white/75">
            {d.tagline}
          </p>
          <h1 className="serif max-w-3xl text-[3.4rem] font-semibold leading-[.95] sm:text-8xl">
            {d.name}
          </h1>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={wa}
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold shadow-2xl"
              style={{ color: c }}
            >
              Book on WhatsApp
            </a>
            <a
              href="#work"
              className="rounded-full border border-white/50 px-8 py-3.5 text-sm font-medium backdrop-blur"
            >
              View portfolio
            </a>
          </div>
        </div>
      </header>
      {stats.length > 0 && (
        <div className="border-b border-stone-200 bg-white">
          <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-stone-200 px-2 py-7 text-center">
            {stats.map(([n, l], i) => (
              <div key={i} className="px-2">
                <div
                  className="serif text-3xl font-semibold sm:text-5xl"
                  style={{ color: c }}
                >
                  {n}
                </div>
                <div className="mt-1 text-xs font-light text-stone-500 sm:text-sm">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABOUT */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
        <Title>About us</Title>
        <p className="serif whitespace-pre-line text-2xl leading-relaxed text-stone-700 sm:text-[1.7rem]">
          {d.about}
        </p>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-white px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <Title sub="Transparent pricing, tailored to your occasion">
            Services and prices
          </Title>
          <div>
            {d.services.map((s, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-4 border-b border-stone-200 py-6 first:border-t"
              >
                <div className="min-w-0">
                  <div
                    className="serif text-3xl font-semibold"
                    style={{ color: ink }}
                  >
                    {s.title}
                  </div>
                  <p className="mt-1 text-sm font-light text-stone-500">
                    {s.text}
                  </p>
                </div>
                <div
                  className="shrink-0 text-right text-base font-semibold sm:text-lg"
                  style={{ color: c }}
                >
                  {s.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="work" className="px-3 py-20 sm:px-6 sm:py-28">
        <Title>Portfolio</Title>
        <div className="sx-cols mx-auto max-w-6xl">
          {d.gallery.length === 0
            ? [1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="mb-2.5 flex items-center justify-center text-5xl"
                  style={{
                    background: c + (n % 2 ? "1f" : "33"),
                    height: n % 3 ? 180 : 260,
                    breakInside: "avoid",
                  }}
                >
                  {emoji}
                </div>
              ))
            : d.gallery.map((g, i) => (
                <img
                  key={i}
                  src={g}
                  alt=""
                  loading="lazy"
                  onClick={() => setBig(g)}
                />
              ))}
        </div>
      </section>

      {/* PROCESS */}
      <section
        className="px-6 py-20 text-white sm:py-28"
        style={{ background: `linear-gradient(160deg, ${c}, #0c0a09 120%)` }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="serif text-4xl font-semibold sm:text-5xl">
              How booking works
            </h2>
          </div>
          <ol className="space-y-7">
            {steps.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-5 border-b border-white/15 pb-7"
              >
                <span className="serif w-10 shrink-0 text-5xl font-semibold leading-none text-white/40">
                  {i + 1}
                </span>
                <span className="pt-1 text-lg font-light">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="px-6 py-20 sm:py-28">
        <Title>Kind words</Title>
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
          {d.reviews.map((r, i) => (
            <figure
              key={i}
              className="border-l-2 pl-6"
              style={{ borderColor: c }}
            >
              <blockquote className="serif text-2xl italic leading-snug text-stone-700">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-3 text-sm font-medium tracking-wide text-stone-500">
                {r.who}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* MAP */}
      {mapEmbed && (
        <section className="px-4 pb-20">
          <Title sub={d.address}>Find us</Title>
          <iframe
            title="map"
            src={mapEmbed}
            loading="lazy"
            className="mx-auto block h-80 w-full max-w-5xl border-0 grayscale-[.4]"
          />
          <div className="mt-4 text-center">
            <a
              href={mapOpen}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full border px-6 py-2.5 text-sm font-medium"
              style={{ color: c, borderColor: c }}
            >
              Open in Google Maps
            </a>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section
        id="contact"
        className="bg-[#0c0a09] px-6 py-20 text-center text-white sm:py-28"
      >
        <h2 className="serif text-5xl font-semibold sm:text-6xl">
          Reserve your date
        </h2>
        <p className="mt-4 font-light text-white/60">
          Call or message us on {d.phone}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={wa}
            className="rounded-full px-9 py-3.5 text-sm font-semibold text-white"
            style={{ background: c }}
          >
            WhatsApp
          </a>
          <a
            href={"tel:" + d.phone}
            className="rounded-full border border-white/30 px-9 py-3.5 text-sm font-medium"
          >
            Call
          </a>
          {instaUrl && (
            <a
              href={instaUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/30 px-9 py-3.5 text-sm font-medium"
            >
              Instagram
            </a>
          )}
        </div>
      </section>

      {/* PITCH */}
      <section className="bg-stone-900 px-6 py-8 text-center text-white">
        <div className="text-sm font-medium">
          This is a demo website made for you.
        </div>
        <p className="mx-auto mt-1 max-w-md text-xs text-stone-400">
          {OWNER.offer}
        </p>
        <a
          href={myWa}
          className="mt-3 inline-block rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold"
        >
          I want this website
        </a>
      </section>

      <a
        href={wa}
        className="fixed bottom-4 right-4 z-20 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-xl"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        WhatsApp
      </a>
      {!isShared && (
        <button
          onClick={tryEdit}
          className="fixed bottom-4 left-4 z-20 rounded-full bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900 shadow-xl"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          ✏️ Edit
        </button>
      )}

      {big && (
        <div
          onClick={() => setBig(null)}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/95 p-3"
        >
          <img src={big} alt="" className="max-h-full max-w-full" />
        </div>
      )}

      {askPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
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

      {open && unlocked && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
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
            <Field label="Business name">
              <input
                className={inp}
                value={d.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Tagline">
              <input
                className={inp}
                value={d.tagline}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </Field>
            <Field label="About">
              <textarea
                rows={4}
                className={inp}
                value={d.about}
                onChange={(e) => set("about", e.target.value)}
              />
            </Field>
            <Field label="Main colour">
              <input
                type="color"
                className="h-10 w-full"
                value={d.color}
                onChange={(e) => set("color", e.target.value)}
              />
            </Field>
            <H>Highlights (one per line: number|label)</H>
            <textarea
              rows={3}
              className={inp}
              value={d.stats || ""}
              onChange={(e) => set("stats", e.target.value)}
            />
            <H>Contact links</H>
            <Field label="Phone number">
              <input
                className={inp}
                value={d.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
            <Field label="WhatsApp number (91 + number, no + or spaces)">
              <input
                className={inp}
                value={d.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </Field>
            <Field label="Instagram username">
              <input
                className={inp}
                value={d.insta}
                onChange={(e) => set("insta", e.target.value)}
              />
            </Field>

            <H>Map</H>
            <Field label="Address / area">
              <textarea
                rows={2}
                className={inp}
                value={d.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>

            <H>Main photo (top of website)</H>
            <ImageInput
              onFile={(f) =>
                readImg(f, 1400, "image/jpeg", (x) => set("hero", x))
              }
            />
            {d.hero && (
              <button
                className="text-xs text-red-600"
                onClick={() => set("hero", "")}
              >
                Remove main photo
              </button>
            )}

            <H>Gallery photos</H>
            <ImageInput onFile={addGallery} />
            {d.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {d.gallery.map((p, i) => (
                  <div key={i} className="relative">
                    <img
                      src={p}
                      alt=""
                      className="h-20 w-full rounded border object-cover"
                    />
                    <button
                      onClick={() =>
                        set(
                          "gallery",
                          d.gallery.filter((_, j) => j !== i),
                        )
                      }
                      className="absolute right-0 top-0 rounded-bl bg-red-600 px-2 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <H>Services & prices</H>
            {d.services.map((s, i) => (
              <div key={i} className="space-y-1 rounded border p-2">
                <input
                  className={inp}
                  placeholder="Name"
                  value={s.title}
                  onChange={(e) =>
                    upList("services", i, "title", e.target.value)
                  }
                />
                <input
                  className={inp}
                  placeholder="Price"
                  value={s.price}
                  onChange={(e) =>
                    upList("services", i, "price", e.target.value)
                  }
                />
                <input
                  className={inp}
                  placeholder="Small note"
                  value={s.text}
                  onChange={(e) =>
                    upList("services", i, "text", e.target.value)
                  }
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
                  Delete this service
                </button>
              </div>
            ))}
            <button
              className="w-full rounded border py-2 text-sm"
              onClick={() =>
                set("services", [
                  ...d.services,
                  { title: "", price: "", text: "" },
                ])
              }
            >
              + Add service
            </button>

            <H>How it works (one step per line)</H>
            <textarea
              rows={5}
              className={inp}
              value={d.steps}
              onChange={(e) => set("steps", e.target.value)}
            />

            <H>Reviews</H>
            {d.reviews.map((r, i) => (
              <div key={i} className="space-y-1 rounded border p-2">
                <input
                  className={inp}
                  placeholder="Customer name"
                  value={r.who}
                  onChange={(e) => upList("reviews", i, "who", e.target.value)}
                />
                <textarea
                  rows={2}
                  className={inp}
                  placeholder="What they said"
                  value={r.text}
                  onChange={(e) => upList("reviews", i, "text", e.target.value)}
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
                  Delete this review
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

            <H>Owner tools</H>
            <a
              href="/msg"
              className="block w-full rounded bg-slate-900 py-2 text-center text-sm font-semibold text-white"
            >
              ✉ Open message maker
            </a>
            <button
              onClick={copyLink}
              className="w-full rounded bg-emerald-500 py-2 text-sm font-semibold text-slate-950"
            >
              Share link
            </button>
            <H>Customer links</H>
            <LinkManager app="site" getData={() => d} />
            <button
              onClick={() => {
                if (confirm("Delete everything and start fresh?")) {
                  localStorage.removeItem("site-data");
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
