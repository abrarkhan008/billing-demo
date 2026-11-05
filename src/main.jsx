import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Bill from "./App.jsx";
import Site from "./Site.jsx";
import Shop from "./Shop.jsx";
import { getShare } from "./extras.jsx";
import "./index.css";

const q = new URLSearchParams(location.search);
const parts = location.pathname.split("/").filter(Boolean);
const first = parts[0];
const direct = ["bill", "site", "shop"].includes(first)
  ? first
  : q.get("app") ||
    (q.has("d") ? "site" : q.has("company") || q.has("s") ? "bill" : "menu");

function Center({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-center text-white">
      <div>{children}</div>
    </div>
  );
}

function Menu() {
  const Card = ({ href, icon, title, text }) => (
    <a
      href={href}
      className="block rounded-2xl bg-white p-6 text-center shadow-xl transition hover:scale-[1.02]"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-5">
      <div className="mx-auto max-w-md space-y-4 pt-8">
        <h1 className="text-center text-3xl font-extrabold text-white">
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
          text="Beautiful website for mehendi, makeup, salon and more."
        />
        <Card
          href="/shop"
          icon="🛒"
          title="Online Shop"
          text="Ecommerce store with cart and WhatsApp ordering."
        />
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
        <p className="mt-1 text-sm text-slate-300">
          Please contact the person who sent it.
        </p>
      </Center>
    );
  const which = share ? share.app : direct;
  const Page = { bill: Bill, site: Site, shop: Shop }[which] || Menu;
  return <Page shared={share?.data} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
