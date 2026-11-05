import { useState } from "react";
import { OWNER } from "./config";
import { ImageInput, LinkManager, readImage } from "./extras";

const DEFAULT = {
  name: "Your Shop Name",
  tagline: "Quality products, delivered to your door",
  banner: "🎉 Festival Sale: up to 30% off. Order today on WhatsApp!",
  whatsapp: "919999999999",
  color: "#4f46e5",
  currency: "₹",
  products: [
    { id: 1, name: "Cotton Kurti", price: 799, old: 1099, cat: "Women", img: "", desc: "Soft, breathable, all-day comfort." },
    { id: 2, name: "Men's Casual Shirt", price: 899, old: 1299, cat: "Men", img: "", desc: "Slim fit, easy to wash and wear." },
    { id: 3, name: "Kids Party Frock", price: 649, old: 0, cat: "Kids", img: "", desc: "Bright colours, comfortable fabric." },
    { id: 4, name: "Leather Wallet", price: 449, old: 599, cat: "Accessories", img: "", desc: "Genuine leather with card slots." },
    { id: 5, name: "Silk Saree", price: 2499, old: 3200, cat: "Women", img: "", desc: "Festive wear with rich zari border." },
    { id: 6, name: "Sports Cap", price: 299, old: 0, cat: "Accessories", img: "", desc: "Light, adjustable, sun protection." },
  ],
};

function load(shared) {
  let d = DEFAULT;
  if (!shared) {
    try {
      const x = JSON.parse(localStorage.getItem("shop-data"));
      if (x) d = { ...DEFAULT, ...x };
    } catch {}
  }
  if (shared) d = { ...d, ...shared };
  return d;
}

const inp = "w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900";
const H = ({ children }) => <h3 className="border-t pt-3 text-sm font-bold text-slate-800">{children}</h3>;

export default function Shop({ shared }) {
  const [d, setD] = useState(() => load(shared));
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [cu, setCu] = useState({ name: "", address: "" });
  const [open, setOpen] = useState(false);
  const [askPass, setAskPass] = useState(false);
  const [passIn, setPassIn] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const c = d.color;
  const save = (n) => {
    setD(n);
    try { localStorage.setItem("shop-data", JSON.stringify(n)); }
    catch { alert("Storage full. Use fewer or smaller photos."); }
  };
  const set = (k, v) => save({ ...d, [k]: v });
  const upP = (i, k, v) => set("products", d.products.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  const money = (n) => d.currency + " " + (+n || 0).toLocaleString("en-IN");

  const cats = ["All", ...new Set(d.products.map((p) => p.cat).filter(Boolean))];
  const list = d.products.filter(
    (p) => (cat === "All" || p.cat === cat) && p.name.toLowerCase().includes(q.toLowerCase()),
  );
  const lines = d.products.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] }));
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const total = lines.reduce((a, l) => a + l.qty * l.price, 0);
  const add = (id) => setCart((x) => ({ ...x, [id]: (x[id] || 0) + 1 }));
  const dec = (id) =>
    setCart((x) => {
      const n = { ...x };
      if (n[id] > 1) n[id]--; else delete n[id];
      return n;
    });

  const order = () => {
    if (!lines.length) return alert("Cart is empty");
    if (!cu.name) return alert("Please enter your name");
    const msg =
      `New order from ${cu.name}\n` +
      lines.map((l) => `• ${l.name} x ${l.qty} = ${money(l.qty * l.price)}`).join("\n") +
      `\n\nTotal: ${money(total)}\nAddress: ${cu.address || "-"}`;
    window.open(`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const isShared = !!shared;
  const tryEdit = () => (unlocked ? setOpen(true) : (setPassIn(""), setAskPass(true)));
  const checkPass = () => {
    if (passIn === OWNER.password) { setUnlocked(true); setAskPass(false); setOpen(true); }
    else alert("Wrong password");
  };
  const myWa = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(OWNER.message)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* top bar */}
      <header className="sticky top-0 z-20 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${c}, #0f172a)` }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 p-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold">{d.name}</div>
            <div className="truncate text-xs opacity-80">{d.tagline}</div>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative rounded-full bg-white px-4 py-2 text-sm font-bold" style={{ color: c }}>
            🛒 Cart
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                {count}
              </span>
            )}
          </button>
        </div>
        {d.banner && <div className="bg-black/30 px-3 py-1.5 text-center text-xs font-medium">{d.banner}</div>}
      </header>

      <div className="mx-auto max-w-6xl p-3">
        {/* search + categories */}
        <input className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm shadow-sm outline-none"
          placeholder="🔍 Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {cats.map((k) => (
            <button key={k} onClick={() => setCat(k)}
              className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold"
              style={cat === k ? { background: c, color: "#fff" } : { background: "#fff", boxShadow: "0 1px 2px #0002" }}>
              {k}
            </button>
          ))}
        </div>

        {/* products */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => {
            const off = p.old > p.price ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative">
                  {p.img ? (
                    <img src={p.img} alt={p.name} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-5xl" style={{ background: c + "18" }}>🛍️</div>
                  )}
                  {off > 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{off}% OFF</span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs text-slate-400">{p.cat}</div>
                  <div className="truncate font-semibold">{p.name}</div>
                  <div className="line-clamp-2 min-h-8 text-xs text-slate-500">{p.desc}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold" style={{ color: c }}>{money(p.price)}</span>
                    {p.old > p.price && <span className="text-xs text-slate-400 line-through">{money(p.old)}</span>}
                  </div>
                  <button onClick={() => add(p.id)} className="mt-2 w-full rounded-lg py-2 text-sm font-semibold text-white" style={{ background: c }}>
                    Add to cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {list.length === 0 && <div className="p-10 text-center text-slate-500">No products found.</div>}

        {/* trust strip */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs font-medium text-slate-600">
          <div className="rounded-xl bg-white p-3 shadow">🚚<br />Fast delivery</div>
          <div className="rounded-xl bg-white p-3 shadow">🔒<br />Safe ordering</div>
          <div className="rounded-xl bg-white p-3 shadow">💬<br />WhatsApp support</div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-center text-white">
          <div className="font-semibold">This is a demo online shop made for you.</div>
          <p className="mt-1 text-sm text-slate-300">{OWNER.offer}</p>
          <a href={myWa} className="mt-3 inline-block rounded-full bg-emerald-500 px-6 py-2 font-semibold">I want this shop</a>
        </div>
      </div>

      {!isShared && (
        <button onClick={tryEdit} className="fixed bottom-4 left-4 z-20 rounded-full bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900 shadow-lg">
          ✏️ Edit
        </button>
      )}

      {/* CART */}
      {cartOpen && (
        <div className="fixed inset-0 z-30 flex justify-end bg-black/50">
          <aside className="flex h-full w-full flex-col bg-white sm:w-96">
            <div className="flex items-center justify-between border-b p-4">
              <b>Your Cart ({count})</b>
              <button onClick={() => setCartOpen(false)} className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">Close</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {lines.length === 0 && <div className="py-10 text-center text-slate-500">Cart is empty</div>}
              {lines.map((l) => (
                <div key={l.id} className="flex items-center gap-3">
                  {l.img ? <img src={l.img} alt="" className="h-14 w-14 rounded object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded bg-slate-100">🛍️</div>}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{l.name}</div>
                    <div className="text-xs text-slate-500">{money(l.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => dec(l.id)} className="h-7 w-7 rounded-full border">−</button>
                    <span className="w-4 text-center text-sm">{l.qty}</span>
                    <button onClick={() => add(l.id)} className="h-7 w-7 rounded-full border">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t p-4">
              <input className={inp} placeholder="Your name" value={cu.name} onChange={(e) => setCu({ ...cu, name: e.target.value })} />
              <input className={inp} placeholder="Delivery address" value={cu.address} onChange={(e) => setCu({ ...cu, address: e.target.value })} />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
              <button onClick={order} className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white">Order on WhatsApp</button>
            </div>
          </aside>
        </div>
      )}

      {/* PASSWORD */}
      {askPass && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs space-y-3 rounded-xl bg-white p-5 text-slate-900">
            <h2 className="font-bold">Owner Login</h2>
            <input type="password" autoFocus className={inp} placeholder="Password" value={passIn}
              onChange={(e) => setPassIn(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkPass()} />
            <div className="flex gap-2">
              <button onClick={() => setAskPass(false)} className="flex-1 rounded border py-2 text-sm">Cancel</button>
              <button onClick={checkPass} className="flex-1 rounded bg-slate-900 py-2 text-sm text-white">Open</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PANEL */}
      {open && unlocked && (
        <div className="fixed inset-0 z-30 flex justify-end bg-black/50">
          <aside className="h-full w-full space-y-3 overflow-y-auto bg-white p-4 text-slate-900 sm:w-96">
            <div className="sticky top-0 -mx-4 -mt-4 flex items-center justify-between bg-white p-4 shadow-sm">
              <h2 className="font-bold">Edit Shop</h2>
              <button onClick={() => setOpen(false)} className="rounded bg-slate-900 px-4 py-2 text-sm text-white">Done ✓</button>
            </div>
            <H>Shop details</H>
            <input className={inp} placeholder="Shop name" value={d.name} onChange={(e) => set("name", e.target.value)} />
            <input className={inp} placeholder="Tagline" value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
            <input className={inp} placeholder="Offer banner" value={d.banner} onChange={(e) => set("banner", e.target.value)} />
            <input className={inp} placeholder="WhatsApp (91 + number)" value={d.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            <div className="flex gap-2">
              <input type="color" className="h-10 w-20" value={d.color} onChange={(e) => set("color", e.target.value)} />
              <input className={inp} placeholder="Currency" value={d.currency} onChange={(e) => set("currency", e.target.value)} />
            </div>

            <H>Products</H>
            {d.products.map((p, i) => (
              <div key={p.id} className="space-y-1 rounded border p-2">
                {p.img && <img src={p.img} alt="" className="h-24 w-full rounded object-cover" />}
                <ImageInput onFile={(f) => readImage(f, 600, "image/jpeg", (x) => upP(i, "img", x))} />
                <input className={inp} placeholder="Product name" value={p.name} onChange={(e) => upP(i, "name", e.target.value)} />
                <div className="grid grid-cols-2 gap-1">
                  <input type="number" className={inp} placeholder="Price" value={p.price} onChange={(e) => upP(i, "price", +e.target.value)} />
                  <input type="number" className={inp} placeholder="Old price" value={p.old} onChange={(e) => upP(i, "old", +e.target.value)} />
                </div>
                <input className={inp} placeholder="Category" value={p.cat} onChange={(e) => upP(i, "cat", e.target.value)} />
                <input className={inp} placeholder="Short description" value={p.desc} onChange={(e) => upP(i, "desc", e.target.value)} />
                <button className="text-xs text-red-600" onClick={() => set("products", d.products.filter((_, j) => j !== i))}>Delete product</button>
              </div>
            ))}
            <button className="w-full rounded border py-2 text-sm"
              onClick={() => set("products", [...d.products, { id: Date.now(), name: "", price: 0, old: 0, cat: "", img: "", desc: "" }])}>
              + Add product
            </button>

            <H>Customer links</H>
            <LinkManager app="shop" getData={() => d} />

            <button
              onClick={() => { if (confirm("Delete everything and start fresh?")) { localStorage.removeItem("shop-data"); location.href = location.pathname; } }}
              className="w-full rounded border border-red-300 py-2 text-sm text-red-600">
              Reset everything
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}