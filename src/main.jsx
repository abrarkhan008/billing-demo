import React from "react";
import ReactDOM from "react-dom/client";
import Bill from "./App.jsx"; // billing / quotation / accounts demo
import Site from "./Site.jsx"; // mehendi / makeup website demo
import "./index.css";

/*
  Which page opens:
    yoursite.com/              -> menu
    yoursite.com/bill/priya    -> billing demo with Priya's details (from presets.js)
    yoursite.com/site/priya    -> website demo with Priya's details (from presets.js)
    yoursite.com/bill          -> billing demo (default details)
    yoursite.com/site          -> website demo (default details)
  Old links (?app=bill, ?s=..., ?d=..., ?company=...) still work.
*/
const q = new URLSearchParams(location.search);
const first = location.pathname.split("/").filter(Boolean)[0];
const which =
  first === "bill" || first === "site"
    ? first
    : q.get("app") ||
      (q.has("d") ? "site" : q.has("company") || q.has("s") ? "bill" : "menu");

function Menu() {
  const base = location.origin;
  const Card = ({ href, icon, title, text }) => (
    <a
      href={href}
      className="block rounded-2xl bg-white p-6 text-center shadow-lg transition hover:scale-[1.02]"
    >
      <div className="text-5xl">{icon}</div>
      <div className="mt-3 text-xl font-bold text-slate-900">{title}</div>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
      <div className="mt-4 inline-block rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white">
        Open demo
      </div>
    </a>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-5">
      <div className="mx-auto max-w-md space-y-4 pt-8">
        <h1 className="text-center text-2xl font-extrabold text-white">
          Our Demo Apps
        </h1>
        <p className="text-center text-sm text-slate-300">
          Tap one to try it. Everything works on your phone.
        </p>
        <Card
          href="/bill"
          icon="🧾"
          title="Billing & Accounts"
          text="Bills, quotations, delivery challan, cash in/out. Download PDF and Excel."
        />
        <Card
          href="/site"
          icon="🌸"
          title="Business Website"
          text="Beautiful website for mehendi, makeup, salon and more. With photos, map, Instagram and WhatsApp."
        />
        <div className="rounded-xl bg-slate-800 p-4 text-xs text-slate-300">
          <div className="mb-1 font-semibold text-white">
            Link format for customers
          </div>
          <div className="break-all">{base}/bill/customername</div>
          <div className="mt-1 break-all">{base}/site/customername</div>
        </div>
      </div>
    </div>
  );
}

const Page = which === "bill" ? Bill : which === "site" ? Site : Menu;

ReactDOM.createRoot(document.getElementById("root")).render(<Page />);
