import React from "react";
import ReactDOM from "react-dom/client";
import Bill from "./App.jsx"; // billing / quotation / accounts demo
import Site from "./Site.jsx"; // mehendi / makeup website demo
import "./index.css";

/*
  Which page opens:
    yoursite.com/             -> menu (choose billing or website)
    yoursite.com/?app=bill    -> billing demo
    yoursite.com/?app=site    -> website demo
  Old billing links (?company=...) still open billing.
  Website share links (?d=...) still open the website.
*/
const q = new URLSearchParams(location.search);
const which =
  q.get("app") || (q.has("d") ? "site" : q.has("company") ? "bill" : "menu");

function Menu() {
  const base = location.origin + location.pathname;
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
          href="?app=bill"
          icon="🧾"
          title="Billing & Accounts"
          text="Bills, quotations, delivery challan, cash in/out. Download PDF and Excel."
        />
        <Card
          href="?app=site"
          icon="🌸"
          title="Business Website"
          text="Beautiful website for mehendi, makeup, salon and more. With photos, map, Instagram and WhatsApp."
        />
        <div className="rounded-xl bg-slate-800 p-4 text-xs text-slate-300">
          <div className="mb-1 font-semibold text-white">
            Links to send customers
          </div>
          <div className="break-all">Billing: {base}?app=bill</div>
          <div className="mt-1 break-all">Website: {base}?app=site</div>
        </div>
      </div>
    </div>
  );
}

const Page = which === "bill" ? Bill : which === "site" ? Site : Menu;

ReactDOM.createRoot(document.getElementById("root")).render(<Page />);
