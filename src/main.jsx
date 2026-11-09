import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Bill from "./App.jsx";
import Site from "./Site.jsx";
import Shop from "./Shop.jsx";
import Dine from "./Dine.jsx";
import Cars from "./Cars.jsx";
import Estate from "./Estate.jsx";
import Messages from "./Messages.jsx";
import { OWNER } from "./config";
import { getShare } from "./extras.jsx";
import "./index.css";

const q = new URLSearchParams(location.search);
const parts = location.pathname.split("/").filter(Boolean);
const first = parts[0];
const direct = [
  "bill",
  "site",
  "shop",
  "dine",
  "cars",
  "estate",
  "msg",
].includes(first)
  ? first
  : q.get("app") ||
    (q.has("d") ? "site" : q.has("company") || q.has("s") ? "bill" : "menu");

function Center({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-center text-white">
      <div>{children}</div>
    </div>
  );
}

const GOLD = "#d4a24c";

function Menu() {
  const wa = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(OWNER.message)}`;
  const Card = ({ href, icon, title, text, tags }) => (
    <a
      href={href}
      className="group block rounded-3xl border border-neutral-800 bg-neutral-900 p-6 transition hover:-translate-y-1 hover:border-amber-500/50"
    >
      <div className="text-4xl">{icon}</div>
      <div className="font-display mt-3 text-2xl font-bold text-white">
        {title}
      </div>
      <p className="mt-1 text-sm text-neutral-400">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-neutral-800 px-3 py-1 text-[11px] text-neutral-300"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 text-sm font-semibold" style={{ color: GOLD }}>
        Try live demo →
      </div>
    </a>
  );
  return (
    <div className="min-h-screen bg-neutral-950 px-5 pb-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="pt-14 text-center">
          <span
            className="rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]"
            style={{ borderColor: GOLD + "66", color: GOLD }}
          >
            Digital tools for modern business
          </span>
          <h1 className="font-display mx-auto mt-5 max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">
            Make your business look{" "}
            <span style={{ color: GOLD }}>world-class</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            Billing, websites, online shops and QR table ordering — branded with
            your name, colours and logo. Works on any phone. No monthly
            commission.
          </p>
          <a
            href={wa}
            className="mt-6 inline-block rounded-full px-8 py-3 font-bold text-black"
            style={{ background: GOLD }}
          >
            Get a free demo with my business name
          </a>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Card
            href="/dine"
            icon="🍽️"
            title="Restaurant QR Ordering"
            text="Guests scan the table QR, order from their phone, and the kitchen sees it live."
            tags={["QR per table", "Live kitchen screen", "Order tracking"]}
          />
          <Card
            href="/bill"
            icon="🧾"
            title="Billing & Accounts"
            text="Invoices, quotations, delivery challans and cash book. PDF and Excel in one tap."
            tags={["GST / VAT / Sales tax", "PDF + Excel", "Your logo"]}
          />
          <Card
            href="/site"
            icon="🌐"
            title="Business Website"
            text="A beautiful booking website for salons, artists, clinics and studios."
            tags={["Gallery", "WhatsApp booking", "Google Map"]}
          />
          <Card
            href="/shop"
            icon="🛍️"
            title="Online Shop"
            text="Catalogue with cart. Orders land straight in your WhatsApp."
            tags={["Cart", "Offers", "No commission"]}
          />
          <Card
            href="/cars"
            icon="🚗"
            title="Used Car Showroom"
            text="Buy and sell pre-owned cars with photos, EMI calculator and WhatsApp enquiries."
            tags={["Buy & sell", "EMI calculator", "Test drive"]}
          />
        </div>
        <Card
          href="/estate"
          icon="🏡"
          title="Real Estate"
          text="Property listings for sale and rent with photos, EMI calculator and site visit booking."
          tags={["Buy & rent", "Site visit", "EMI calculator"]}
        />

        <div className="mt-12 grid grid-cols-3 gap-3 text-center text-xs text-neutral-400">
          <div className="rounded-2xl bg-neutral-900 p-4">
            ⚡<br />
            Live in 48 hours
          </div>
          <div className="rounded-2xl bg-neutral-900 p-4">
            🎨
            <br />
            Your brand, your colours
          </div>
          <div className="rounded-2xl bg-neutral-900 p-4">
            🌍
            <br />
            Any currency, any country
          </div>
        </div>
      </div>
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
      site: Site,
      shop: Shop,
      dine: Dine,
      cars: Cars,
      estate: Estate,
      msg: Messages,
    }[which] || Menu;
  return <Page shared={share?.data} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
