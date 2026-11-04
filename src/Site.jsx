import { useState } from "react";
import { OWNER } from "./config";

/* ========== STARTING DETAILS (you can change all of this inside the website) ========== */
const DEFAULT = {
  name: "Your Business Name",
  tagline: "Mehendi & Makeup Artist",
  phone: "9999999999",
  whatsapp: "919999999999", // country code + number, no +
  insta: "", // only the username, example: priya_mehendi
  address: "", // type the area / shop address, map will appear
  color: "#9d174d",
  about:
    "Write about your work here. Years of experience, areas you serve, special styles.",
  hero: "",
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

const isShared = new URLSearchParams(location.search).has("d");

function load() {
  let d = DEFAULT;
  try {
    const x = JSON.parse(localStorage.getItem("site-data"));
    if (x) d = { ...DEFAULT, ...x };
  } catch {}
  try {
    const q = new URLSearchParams(location.search).get("d");
    if (q) d = { ...d, ...JSON.parse(decodeURIComponent(escape(atob(q)))) };
  } catch {}
  return d;
}

// make photo smaller so phone storage does not fill up
function readImage(file, max, cb) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * k;
      c.height = img.height * k;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/jpeg", 0.8));
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

const inp =
  "w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900";
const Field = ({ label, children }) => (
  <label className="block text-xs font-medium text-slate-600">
    {label}
    <div className="mt-1">{children}</div>
  </label>
);
const H = ({ children }) => (
  <h3 className="border-t pt-3 text-sm font-bold text-slate-800">{children}</h3>
);

export default function Site() {
  const [d, setD] = useState(load);
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
  const upList = (key, i, f, v) =>
    set(
      key,
      d[key].map((x, j) => (j === i ? { ...x, [f]: v } : x)),
    );

  const c = d.color;
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

  const onHero = (e) => {
    const f = e.target.files[0];
    if (f) readImage(f, 1400, (x) => set("hero", x));
  };
  const onGallery = (e) => {
    const files = Array.from(e.target.files);
    let next = [...d.gallery];
    let left = files.length;
    files.forEach((f) =>
      readImage(f, 900, (x) => {
        next = [...next, x];
        if (--left === 0) set("gallery", next);
      }),
    );
    e.target.value = "";
  };

  const copyLink = () => {
    const { hero, gallery, ...text } = d;
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(text))));
    const url =
      location.origin + location.pathname + "?d=" + encodeURIComponent(code);
    navigator.clipboard?.writeText(url);
    alert(
      "Link copied! Send it to your customer.\n\nNote: photos are NOT inside the link. Customer will see your text, colour, map, Instagram and WhatsApp. To show photos, open the website on this phone and give it to the customer.",
    );
  };

  return (
    <div
      className="min-h-screen bg-white text-slate-800"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {/* HERO */}
      <section
        className="relative flex min-h-[85vh] items-center justify-center bg-cover bg-center text-center text-white"
        style={{
          backgroundImage: d.hero
            ? `url(${d.hero})`
            : `linear-gradient(135deg, ${c}, #000)`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-6">
          <h1 className="text-4xl font-extrabold sm:text-6xl">{d.name}</h1>
          <p className="mt-3 text-lg italic sm:text-2xl">{d.tagline}</p>
          <a
            href={wa}
            className="mt-7 inline-block rounded-full px-8 py-3 font-semibold text-white shadow-lg"
            style={{ background: c }}
          >
            Book Now on WhatsApp
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h2 className="text-2xl font-bold" style={{ color: c }}>
          About Us
        </h2>
        <p className="mt-3 whitespace-pre-line text-slate-600">{d.about}</p>
      </section>

      {/* SERVICES */}
      <section className="bg-slate-50 px-6 py-12">
        <h2 className="text-center text-2xl font-bold" style={{ color: c }}>
          Services & Prices
        </h2>
        <div className="mx-auto mt-6 grid max-w-5xl gap-4 sm:grid-cols-3">
          {d.services.map((s, i) => (
            <div key={i} className="rounded-xl bg-white p-5 shadow">
              <div className="text-lg font-bold">{s.title}</div>
              <div className="mt-1 font-semibold" style={{ color: c }}>
                {s.price}
              </div>
              <p className="mt-2 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="px-4 py-12">
        <h2 className="text-center text-2xl font-bold" style={{ color: c }}>
          Our Work
        </h2>
        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3">
          {d.gallery.length === 0
            ? [1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="flex aspect-square items-center justify-center rounded-lg text-4xl"
                  style={{ background: c + "22" }}
                >
                  🌸
                </div>
              ))
            : d.gallery.map((g, i) => (
                <img
                  key={i}
                  src={g}
                  alt=""
                  loading="lazy"
                  onClick={() => setBig(g)}
                  className="aspect-square w-full cursor-pointer rounded-lg object-cover"
                />
              ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 px-6 py-12">
        <h2 className="text-center text-2xl font-bold" style={{ color: c }}>
          How It Works
        </h2>
        <ol className="mx-auto mt-6 max-w-xl space-y-3">
          {steps.map((t, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg bg-white p-3 shadow"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white"
                style={{ background: c }}
              >
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </section>

      {/* REVIEWS */}
      <section className="px-6 py-12">
        <h2 className="text-center text-2xl font-bold" style={{ color: c }}>
          Happy Customers
        </h2>
        <div className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-2">
          {d.reviews.map((r, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div>⭐⭐⭐⭐⭐</div>
              <p className="mt-1 text-slate-600">"{r.text}"</p>
              <div className="mt-2 text-sm font-semibold">— {r.who}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MAP */}
      {mapEmbed && (
        <section className="px-4 pb-12">
          <h2 className="text-center text-2xl font-bold" style={{ color: c }}>
            Find Us
          </h2>
          <p className="mt-1 text-center text-sm text-slate-600">{d.address}</p>
          <iframe
            title="map"
            src={mapEmbed}
            loading="lazy"
            className="mx-auto mt-4 block h-72 w-full max-w-4xl rounded-xl border-0"
          />
          <div className="mt-3 text-center">
            <a
              href={mapOpen}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full border px-5 py-2 text-sm font-semibold"
              style={{ color: c, borderColor: c }}
            >
              Open in Google Maps
            </a>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section
        className="px-6 py-12 text-center text-white"
        style={{ background: c }}
      >
        <h2 className="text-2xl font-bold">Book Your Date</h2>
        <p className="mt-2">Call or WhatsApp: {d.phone}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href={wa}
            className="rounded-full bg-white px-8 py-3 font-semibold"
            style={{ color: c }}
          >
            WhatsApp
          </a>
          <a
            href={"tel:" + d.phone}
            className="rounded-full border border-white px-8 py-3 font-semibold"
          >
            Call
          </a>
          {instaUrl && (
            <a
              href={instaUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white px-8 py-3 font-semibold"
            >
              Instagram
            </a>
          )}
        </div>
      </section>

      {/* YOUR PITCH */}
      <section className="bg-slate-900 px-6 py-8 text-center text-white">
        <div className="font-semibold">
          This is a demo website made for you.
        </div>
        <p className="mt-1 text-sm text-slate-300">{OWNER.offer}</p>
        <a
          href={myWa}
          className="mt-3 inline-block rounded bg-emerald-500 px-5 py-2 font-semibold"
        >
          I want this website
        </a>
      </section>

      {/* floating buttons */}
      <a
        href={wa}
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

      {big && (
        <div
          onClick={() => setBig(null)}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/90 p-4"
        >
          <img src={big} alt="" className="max-h-full max-w-full rounded" />
        </div>
      )}

      {/* PASSWORD */}
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
          className="fixed inset-0 z-30 flex justify-end bg-black/50"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <aside className="h-full w-full space-y-3 overflow-y-auto bg-white p-4 text-slate-900 sm:w-96">
            <div className="sticky top-0 -mx-4 -mt-4 flex items-center justify-between bg-white p-4 shadow-sm">
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
            <Field label="Instagram username (example: priya_mehendi)">
              <input
                className={inp}
                value={d.insta}
                onChange={(e) => set("insta", e.target.value)}
              />
            </Field>

            <H>Map</H>
            <Field label="Address / area (map appears automatically)">
              <textarea
                rows={2}
                className={inp}
                value={d.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>

            <H>Main photo (top of website)</H>
            <input
              type="file"
              accept="image/*"
              onChange={onHero}
              className="text-xs"
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
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onGallery}
              className="text-xs"
            />
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

            <H>Share</H>
            <button
              onClick={copyLink}
              className="w-full rounded bg-slate-900 py-2 text-sm text-white"
            >
              Copy link for customer
            </button>
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
