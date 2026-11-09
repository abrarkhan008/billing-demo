import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { OWNER } from "./config";
import {
  ImageInput,
  LinkManager,
  readImage,
  createShare,
  saveOrder,
  getOrder,
  listOrders,
  setOrderStatus,
} from "./extras";

const STEPS = ["New", "Preparing", "Ready", "Served"];

const DEFAULT = {
  name: "Spice Garden",
  tagline: "Modern Indian Kitchen · Since 2012",
  color: "#d4a24c",
  currency: "₹",
  tax: 5,
  taxName: "GST",
  whatsapp: "919999999999",
  tables: 10,
  items: [
    { id: 1, name: "Paneer Tikka", price: 289, cat: "Starters", veg: true, img: "", emoji: "🧀", desc: "Char-grilled cottage cheese, mint chutney.", tag: "Chef's pick" },
    { id: 2, name: "Chicken 65", price: 319, cat: "Starters", veg: false, img: "", emoji: "🍗", desc: "Crisp, spicy South Indian fried chicken.", tag: "" },
    { id: 3, name: "Butter Chicken", price: 429, cat: "Mains", veg: false, img: "", emoji: "🍛", desc: "Slow-cooked in tomato butter gravy.", tag: "Bestseller" },
    { id: 4, name: "Dal Makhani", price: 339, cat: "Mains", veg: true, img: "", emoji: "🥘", desc: "Black lentils simmered overnight.", tag: "" },
    { id: 5, name: "Garlic Naan", price: 79, cat: "Breads & Rice", veg: true, img: "", emoji: "🫓", desc: "Tandoor-baked, brushed with butter.", tag: "" },
    { id: 6, name: "Hyderabadi Biryani", price: 389, cat: "Breads & Rice", veg: false, img: "", emoji: "🍚", desc: "Dum-cooked basmati with raita.", tag: "Bestseller" },
    { id: 7, name: "Gulab Jamun", price: 149, cat: "Desserts", veg: true, img: "", emoji: "🍮", desc: "Warm, soft, with saffron syrup.", tag: "" },
    { id: 8, name: "Mango Lassi", price: 129, cat: "Drinks", veg: true, img: "", emoji: "🥭", desc: "Thick, chilled, fresh mango.", tag: "" },
  ],
};

function load(shared) {
  let d = DEFAULT;
  if (!shared) {
    try {
      const x = JSON.parse(localStorage.getItem("dine-data"));
      if (x) d = { ...DEFAULT, ...x };
    } catch {}
  }
  if (shared) d = { ...d, ...shared };
  return d;
}

const inp =
  "w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900";
const H = ({ children }) => (
  <h3 className="border-t pt-3 text-sm font-bold text-slate-800">{children}</h3>
);
const VegDot = ({ veg }) => (
  <span
    className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2"
    style={{ borderColor: veg ? "#16a34a" : "#dc2626" }}
  >
    <span
      className="h-2 w-2 rounded-full"
      style={{ background: veg ? "#16a34a" : "#dc2626" }}
    />
  </span>
);

export default function Dine({ shared }) {
  const qs = new URLSearchParams(location.search);
  const [d, setD] = useState(() => load(shared));
  const [view, setView] = useState("menu"); // menu | kitchen | qr
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [table, setTable] = useState(qs.get("t") || "");
  const [note, setNote] = useState("");
  const [placed, setPlaced] = useState(null);
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState([]);
  const [qrs, setQrs] = useState([]);
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [askPass, setAskPass] = useState(false);
  const [passIn, setPassIn] = useState("");
  const [pending, setPending] = useState(null);

  const c = d.color;
  const staff = !shared || qs.has("k"); // staff buttons visible
  const shop = (d.name || "shop").toLowerCase().replace(/[^a-z0-9]/g, "");
  const money = (n) =>
    d.currency +
    " " +
    (+n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const save = (n) => {
    setD(n);
    try {
      localStorage.setItem("dine-data", JSON.stringify(n));
    } catch {
      alert("Storage full. Use fewer or smaller photos.");
    }
  };
  const set = (k, v) => save({ ...d, [k]: v });
  const upI = (i, k, v) =>
    set("items", d.items.map((p, j) => (j === i ? { ...p, [k]: v } : p)));

  const cats = ["All", ...new Set(d.items.map((p) => p.cat).filter(Boolean))];
  const list = d.items.filter(
    (p) =>
      (cat === "All" || p.cat === cat) &&
      (!vegOnly || p.veg) &&
      p.name.toLowerCase().includes(q.toLowerCase()),
  );
  const lines = d.items
    .filter((p) => cart[p.id])
    .map((p) => ({ ...p, qty: cart[p.id] }));
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const sub = lines.reduce((a, l) => a + l.qty * l.price, 0);
  const taxAmt = (sub * (+d.tax || 0)) / 100;
  const total = sub + taxAmt;
  const add = (id) => setCart((x) => ({ ...x, [id]: (x[id] || 0) + 1 }));
  const dec = (id) =>
    setCart((x) => {
      const n = { ...x };
      if (n[id] > 1) n[id]--;
      else delete n[id];
      return n;
    });

  /* ---------- password gate ---------- */
  const need = (fn) => {
    if (unlocked) fn();
    else {
      setPending(() => fn);
      setPassIn("");
      setAskPass(true);
    }
  };
  const checkPass = () => {
    if (passIn !== OWNER.password) return alert("Wrong password");
    setUnlocked(true);
    setAskPass(false);
    pending && pending();
    setPending(null);
  };

  /* ---------- customer: place order ---------- */
  const placeOrder = async () => {
    if (!lines.length) return alert("Your cart is empty");
    if (!table) return alert("Please enter your table number");
    setBusy(true);
    const order = {
      shop,
      table,
      note,
      status: "New",
      items: lines.map((l) => ({ n: l.name, q: l.qty, p: l.price })),
      sub,
      tax: taxAmt,
      total,
      at: Date.now(),
    };
    try {
      const id = await saveOrder(order);
      setPlaced({ id, status: "New", total });
      setCart({});
      setCartOpen(false);
      setNote("");
    } catch {
      alert("Could not send the order. Please call the waiter.");
    }
    setBusy(false);
  };

  // customer: live status tracking
  useEffect(() => {
    if (!placed || placed.status === "Served") return;
    const t = setInterval(async () => {
      try {
        const r = await getOrder(placed.id);
        if (r?.data?.status)
          setPlaced((p) => p && { ...p, status: r.data.status });
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [placed?.id, placed?.status]);

  /* ---------- kitchen ---------- */
  const refresh = async () => {
    try {
      setOrders(await listOrders(shop));
    } catch {}
  };
  useEffect(() => {
    if (view !== "kitchen") return;
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [view, shop]);
  const advance = async (o) => {
    const i = STEPS.indexOf(o.data.status);
    await setOrderStatus(o.id, {
      ...o.data,
      status: STEPS[Math.min(i + 1, STEPS.length - 1)],
    });
    refresh();
  };

  /* ---------- QR codes ---------- */
  const makeQrs = async () => {
    setBusy(true);
    try {
      const base = await createShare("dine", "QR menu", d);
      const out = [];
      for (let n = 1; n <= (+d.tables || 1); n++)
        out.push({
          n,
          src: await QRCode.toDataURL(`${base}?t=${n}`, {
            width: 360,
            margin: 1,
          }),
        });
      setQrs(out);
      setView("qr");
      setOpen(false);
    } catch {
      alert("Could not create QR codes. Check Supabase keys in extras.jsx");
    }
    setBusy(false);
  };

  const myWa = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(OWNER.message)}`;

  /* ================= KITCHEN SCREEN ================= */
  if (view === "kitchen")
    return (
      <div className="min-h-screen bg-neutral-950 p-3 text-neutral-100">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("menu")}
              className="rounded bg-neutral-800 px-3 py-2 text-xs"
            >
              ← Menu
            </button>
            <b className="text-lg">👨‍🍳 Kitchen · live orders</b>
            <span className="ml-auto text-xs text-neutral-400">
              updates every 4 sec
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orders.length === 0 && (
              <div className="col-span-full p-10 text-center text-neutral-500">
                No orders yet. Place one from the customer menu.
              </div>
            )}
            {orders.map((o) => {
              const x = o.data;
              const done = x.status === "Served";
              return (
                <div
                  key={o.id}
                  className={
                    "rounded-2xl border p-4 " +
                    (done
                      ? "border-neutral-800 opacity-50"
                      : "border-neutral-700 bg-neutral-900")
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-extrabold" style={{ color: c }}>
                      Table {x.table}
                    </div>
                    <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs">
                      {x.status}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {x.items.map((it, i) => (
                      <li key={i}>
                        <b>{it.q} ×</b> {it.n}
                      </li>
                    ))}
                  </ul>
                  {x.note && (
                    <div className="mt-2 rounded bg-amber-500/10 p-2 text-xs text-amber-300">
                      📝 {x.note}
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                    <span>{new Date(x.at).toLocaleTimeString()}</span>
                    <span>{money(x.total)}</span>
                  </div>
                  {!done && (
                    <button
                      onClick={() => advance(o)}
                      className="mt-3 w-full rounded-lg py-2 text-sm font-bold text-black"
                      style={{ background: c }}
                    >
                      Mark as {STEPS[STEPS.indexOf(x.status) + 1]} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );

  /* ================= PRINTABLE QR SHEET ================= */
  if (view === "qr")
    return (
      <div className="min-h-screen bg-white p-4 text-slate-900">
        <style>{`@media print{.noprint{display:none}@page{margin:10mm}}`}</style>
        <div className="noprint mb-4 flex gap-2">
          <button
            onClick={() => setView("menu")}
            className="rounded border px-4 py-2 text-sm"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
          >
            🖨 Print / Save PDF
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {qrs.map((x) => (
            <div
              key={x.n}
              className="break-inside-avoid rounded-2xl border-2 p-4 text-center"
              style={{ borderColor: c }}
            >
              <div className="font-extrabold">{d.name}</div>
              <img src={x.src} alt="" className="mx-auto my-2 w-full max-w-[200px]" />
              <div className="text-sm text-slate-600">Scan to view menu & order</div>
              <div
                className="mt-1 text-2xl font-extrabold"
                style={{ color: c }}
              >
                Table {x.n}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  /* ================= CUSTOMER MENU ================= */
  return (
    <div className="min-h-screen bg-neutral-950 pb-28 text-neutral-100">
      {/* hero */}
      <header
        className="relative overflow-hidden px-5 pb-8 pt-10 text-center"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${c}44, transparent 65%)`,
        }}
      >
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
          {table ? `Table ${table}` : "Welcome"}
        </div>
        <h1
          className="font-display mt-2 text-4xl font-bold sm:text-5xl"
          style={{ color: c }}
        >
          {d.name}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">{d.tagline}</p>
      </header>

      {/* sticky filters */}
      <div className="sticky top-0 z-20 border-y border-neutral-800 bg-neutral-950/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <input
            className="min-w-0 flex-1 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm outline-none"
            placeholder="Search dishes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={
              "flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-xs " +
              (vegOnly
                ? "border-green-500 bg-green-500/20"
                : "border-neutral-800")
            }
          >
            <VegDot veg /> Veg
          </button>
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl gap-2 overflow-x-auto">
          {cats.map((k) => (
            <button
              key={k}
              onClick={() => setCat(k)}
              className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold"
              style={
                cat === k
                  ? { background: c, color: "#000" }
                  : { background: "#171717" }
              }
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* order status banner */}
      {placed && (
        <div className="mx-auto mt-4 max-w-3xl px-3">
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: c + "88", background: c + "11" }}
          >
            <div className="flex items-center justify-between">
              <b>Your order is placed ✓</b>
              <button
                className="text-xs text-neutral-400"
                onClick={() => setPlaced(null)}
              >
                hide
              </button>
            </div>
            <div className="mt-3 flex items-center">
              {STEPS.map((s, i) => {
                const on = i <= STEPS.indexOf(placed.status);
                return (
                  <div key={s} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                        style={
                          on
                            ? { background: c, color: "#000" }
                            : { background: "#262626" }
                        }
                      >
                        {i + 1}
                      </div>
                      <div className="mt-1 text-[10px] text-neutral-400">{s}</div>
                    </div>
                    {i < 3 && (
                      <div
                        className="mx-1 mb-4 h-0.5 flex-1"
                        style={{ background: on ? c : "#262626" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* menu */}
      <main className="mx-auto mt-4 max-w-3xl space-y-3 px-3">
        {list.map((p) => (
          <div
            key={p.id}
            className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3"
          >
            {p.img ? (
              <img
                src={p.img}
                alt={p.name}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl text-4xl"
                style={{ background: c + "22" }}
              >
                {p.emoji || "🍽️"}
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <VegDot veg={p.veg} />
                <span className="truncate font-semibold">{p.name}</span>
              </div>
              {p.tag && (
                <span
                  className="mt-0.5 w-fit rounded-full px-2 text-[10px] font-bold text-black"
                  style={{ background: c }}
                >
                  {p.tag}
                </span>
              )}
              <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                {p.desc}
              </p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <b style={{ color: c }}>{money(p.price)}</b>
                {cart[p.id] ? (
                  <div
                    className="flex items-center gap-3 rounded-full px-2 py-1 text-black"
                    style={{ background: c }}
                  >
                    <button onClick={() => dec(p.id)} className="px-2 font-bold">
                      −
                    </button>
                    <span className="text-sm font-bold">{cart[p.id]}</span>
                    <button onClick={() => add(p.id)} className="px-2 font-bold">
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => add(p.id)}
                    className="rounded-full border px-5 py-1 text-sm font-bold"
                    style={{ borderColor: c, color: c }}
                  >
                    ADD
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="p-10 text-center text-neutral-500">No dishes found.</div>
        )}

        <div className="rounded-2xl bg-neutral-900 p-5 text-center text-sm">
          <div className="font-semibold">This is a live demo for your restaurant.</div>
          <p className="mt-1 text-neutral-400">
            Order something, then open the Kitchen screen and watch it arrive.
          </p>
          <a
            href={myWa}
            className="mt-3 inline-block rounded-full px-6 py-2 font-bold text-black"
            style={{ background: c }}
          >
            I want this for my restaurant
          </a>
        </div>
      </main>

      {/* floating cart bar */}
      {count > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-1/2 z-30 flex w-[92%] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl px-5 py-4 font-bold text-black shadow-2xl"
          style={{ background: c }}
        >
          <span>
            {count} item{count > 1 ? "s" : ""} · {money(total)}
          </span>
          <span>View cart →</span>
        </button>
      )}

      {/* staff buttons */}
      {staff && (
        <div className="fixed left-3 top-3 z-40 flex gap-2 text-xs">
          <button
            onClick={() => need(() => setView("kitchen"))}
            className="rounded-full bg-neutral-800/90 px-3 py-2"
          >
            👨‍🍳 Kitchen
          </button>
          {!shared && (
            <button
              onClick={() => need(() => setOpen(true))}
              className="rounded-full bg-amber-400 px-3 py-2 font-bold text-black"
            >
              ⚙ Edit
            </button>
          )}
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl bg-neutral-900 p-5 sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <b className="text-lg">Your order</b>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded bg-neutral-800 px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>
            {lines.map((l) => (
              <div key={l.id} className="flex items-center gap-3 text-sm">
                <VegDot veg={l.veg} />
                <span className="flex-1">{l.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dec(l.id)}
                    className="h-7 w-7 rounded-full border border-neutral-700"
                  >
                    −
                  </button>
                  <span>{l.qty}</span>
                  <button
                    onClick={() => add(l.id)}
                    className="h-7 w-7 rounded-full border border-neutral-700"
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right">{money(l.qty * l.price)}</span>
              </div>
            ))}
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
              placeholder="Table number"
              inputMode="numeric"
              value={table}
              onChange={(e) => setTable(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
              placeholder="Notes (less spicy, no onion…)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="space-y-1 border-t border-neutral-800 pt-3 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>{money(sub)}</span>
              </div>
              {+d.tax > 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>
                    {d.taxName} ({d.tax}%)
                  </span>
                  <span>{money(taxAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span style={{ color: c }}>{money(total)}</span>
              </div>
            </div>
            <button
              disabled={busy}
              onClick={placeOrder}
              className="w-full rounded-xl py-3 font-bold text-black"
              style={{ background: c }}
            >
              {busy ? "Sending…" : "Place order"}
            </button>
          </div>
        </div>
      )}

      {/* PASSWORD */}
      {askPass && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xs space-y-3 rounded-xl bg-white p-5 text-slate-900">
            <h2 className="font-bold">Staff Login</h2>
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
        <div className="fixed inset-0 z-[55] flex justify-end bg-black/60">
          <aside className="h-full w-full space-y-3 overflow-y-auto bg-white p-4 text-slate-900 sm:w-96">
            <div className="sticky top-0 -mx-4 -mt-4 flex items-center justify-between bg-white p-4 shadow-sm">
              <h2 className="font-bold">Edit Restaurant</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Done ✓
              </button>
            </div>
            <H>Details</H>
            <input className={inp} placeholder="Restaurant name" value={d.name} onChange={(e) => set("name", e.target.value)} />
            <input className={inp} placeholder="Tagline" value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <input type="color" className="h-10 w-full" value={d.color} onChange={(e) => set("color", e.target.value)} />
              <input className={inp} placeholder="Currency ($, ₹, £)" value={d.currency} onChange={(e) => set("currency", e.target.value)} />
              <input type="number" className={inp} placeholder="Tax %" value={d.tax} onChange={(e) => set("tax", +e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={inp} placeholder="Tax name (GST, VAT, Sales Tax)" value={d.taxName} onChange={(e) => set("taxName", e.target.value)} />
              <input type="number" className={inp} placeholder="Number of tables" value={d.tables} onChange={(e) => set("tables", +e.target.value)} />
            </div>

            <H>Table QR codes</H>
            <button
              disabled={busy}
              onClick={makeQrs}
              className="w-full rounded bg-emerald-600 py-2 text-sm font-semibold text-white"
            >
              {busy ? "Creating…" : "Generate printable QR for every table"}
            </button>

            <H>Menu items</H>
            {d.items.map((p, i) => (
              <div key={p.id} className="space-y-1 rounded border p-2">
                {p.img && <img src={p.img} alt="" className="h-24 w-full rounded object-cover" />}
                <ImageInput onFile={(f) => readImage(f, 500, "image/jpeg", (x) => upI(i, "img", x))} />
                <input className={inp} placeholder="Dish name" value={p.name} onChange={(e) => upI(i, "name", e.target.value)} />
                <div className="grid grid-cols-2 gap-1">
                  <input type="number" className={inp} placeholder="Price" value={p.price} onChange={(e) => upI(i, "price", +e.target.value)} />
                  <input className={inp} placeholder="Category" value={p.cat} onChange={(e) => upI(i, "cat", e.target.value)} />
                </div>
                <input className={inp} placeholder="Description" value={p.desc} onChange={(e) => upI(i, "desc", e.target.value)} />
                <input className={inp} placeholder="Badge (Bestseller, Spicy…)" value={p.tag} onChange={(e) => upI(i, "tag", e.target.value)} />
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={p.veg} onChange={(e) => upI(i, "veg", e.target.checked)} /> Vegetarian
                </label>
                <button className="text-xs text-red-600" onClick={() => set("items", d.items.filter((_, j) => j !== i))}>
                  Delete dish
                </button>
              </div>
            ))}
            <button
              className="w-full rounded border py-2 text-sm"
              onClick={() =>
                set("items", [...d.items, { id: Date.now(), name: "", price: 0, cat: "Starters", veg: true, img: "", emoji: "🍽️", desc: "", tag: "" }])
              }
            >
              + Add dish
            </button>
  <H>Owner tools</H>
            <a
              href="/msg"
              className="block w-full rounded bg-slate-900 py-2 text-center text-sm font-semibold text-white"
            >
              ✉ Open message maker
            </a>
            <H>Customer links</H>
            <LinkManager app="dine" getData={() => d} />
            <button
              onClick={() => {
                if (confirm("Delete everything and start fresh?")) {
                  localStorage.removeItem("dine-data");
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