import { useState, useEffect } from "react";

/* ====== PASTE YOUR SUPABASE DETAILS HERE ====== */
const SB_URL = "https://xdmvvzcmreagdcfuwzrf.supabase.co";
const SB_KEY = "sb_publishable_H92dY-yo2fBgVZD7QmkXzA_LGROpRqv";
/* ============================================== */

const HD = {
  apikey: SB_KEY,
  "Content-Type": "application/json",
};
const api = (path, opt = {}) =>
  fetch(`${SB_URL}/rest/v1/shares${path}`, {
    ...opt,
    headers: { ...HD, ...(opt.headers || {}) },
  });
const newId = () => Math.random().toString(36).slice(2, 8);

/* ---------- short links ---------- */
export async function createShare(app, label, data) {
  const id = newId();
  const r = await api("", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ id, app, label, data, active: true }),
  });
  if (!r.ok) throw new Error("create failed");
  return location.origin + "/s/" + id;
}
export async function getShare(id) {
  const r = await api(`?id=eq.${encodeURIComponent(id)}&select=*`);
  if (!r.ok) throw new Error("fetch failed");
  return (await r.json())[0] || null;
}
async function listShares(app) {
  const r = await api(
    `?app=eq.${app}&select=id,label,active,created_at&order=created_at.desc`,
  );
  return r.ok ? r.json() : [];
}
const setActive = (id, active) =>
  api(`?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ active }) });
const removeShare = (id) => api(`?id=eq.${id}`, { method: "DELETE" });

/* ---------- image helper (shrinks photo) ---------- */
export function readImage(file, max, type, cb) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * k;
      c.height = img.height * k;
      const x = c.getContext("2d");
      if (type === "image/jpeg") {
        x.fillStyle = "#fff";
        x.fillRect(0, 0, c.width, c.height);
      }
      x.drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL(type, 0.8));
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

/* ---------- PASTE or UPLOAD image box ---------- */
export function ImageInput({ onFile }) {
  const onPaste = (e) => {
    const it = [...(e.clipboardData?.items || [])].find((i) =>
      i.type.startsWith("image/"),
    );
    if (it) {
      e.preventDefault();
      onFile(it.getAsFile());
    } else
      alert(
        "No image found. Right-click the image > Copy image, then paste here.",
      );
  };
  const pasteBtn = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const it of items) {
        const t = it.types.find((t) => t.startsWith("image/"));
        if (t) {
          onFile(new File([await it.getType(t)], "pasted", { type: t }));
          return;
        }
      }
      alert("No copied image found. Copy an image first.");
    } catch {
      alert("Tap the dotted box and paste (Ctrl+V, or long-press > Paste).");
    }
  };
  return (
    <div className="space-y-2">
      <div
        tabIndex={0}
        onPaste={onPaste}
        className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs text-slate-500 outline-none focus:border-blue-500 focus:bg-blue-50"
      >
        📋 Tap here, then press <b>Ctrl+V</b> (phone: long-press, then Paste) to
        paste a copied image
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={pasteBtn}
          className="flex-1 rounded border bg-white py-2 text-xs font-medium"
        >
          📋 Paste copied image
        </button>
        <label className="flex-1 cursor-pointer rounded border bg-white py-2 text-center text-xs font-medium">
          ⬆ Upload
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              Array.from(e.target.files).forEach(onFile);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

/* ---------- LINK MANAGER (create / pause / delete) ---------- */
export function LinkManager({ app, getData }) {
  const [list, setList] = useState([]);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () =>
    listShares(app)
      .then(setList)
      .catch(() => {});
  useEffect(() => {
    refresh();
  }, []);

  const make = async () => {
    setBusy(true);
    try {
      const url = await createShare(app, label || "Customer", getData());
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
      alert(
        "Short link ready:\n\n" + url + "\n\n(Copied. Send it on WhatsApp.)",
      );
      setLabel("");
      refresh();
    } catch {
      alert(
        "Could not create link. Check internet and the Supabase keys in extras.jsx",
      );
    }
    setBusy(false);
  };
  const copy = async (id) => {
    const u = location.origin + "/s/" + id;
    try {
      await navigator.clipboard.writeText(u);
      alert("Copied:\n" + u);
    } catch {
      prompt("Copy this link:", u);
    }
  };

  return (
    <div className="space-y-2">
      <input
        className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm"
        placeholder="Customer name (so you remember)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <button
        onClick={make}
        disabled={busy}
        className="w-full rounded bg-emerald-600 py-2 text-sm font-semibold text-white"
      >
        {busy ? "Creating..." : "🔗 Create short link"}
      </button>
      {list.map((l) => (
        <div key={l.id} className="rounded border border-slate-200 p-2 text-sm">
          <div className="flex items-center justify-between">
            <b className="truncate">{l.label}</b>
            <span
              className={
                "rounded-full px-2 text-xs " +
                (l.active
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700")
              }
            >
              {l.active ? "Active" : "Stopped"}
            </span>
          </div>
          <div className="text-xs text-slate-500">/s/{l.id}</div>
          <div className="mt-2 flex gap-2 text-xs">
            <button
              className="flex-1 rounded border py-1.5"
              onClick={() => copy(l.id)}
            >
              Copy
            </button>
            <button
              className="flex-1 rounded border py-1.5"
              onClick={async () => {
                await setActive(l.id, !l.active);
                refresh();
              }}
            >
              {l.active ? "Stop link" : "Start again"}
            </button>
            <button
              className="flex-1 rounded border border-red-300 py-1.5 text-red-600"
              onClick={async () => {
                if (confirm("Delete this link forever?")) {
                  await removeShare(l.id);
                  refresh();
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- PROFESSIONAL LETTERHEAD (used in bill) ---------- */
export function Letterhead({ s, radius, initials }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl px-4 py-4 text-white sm:px-6"
      style={{
        background: `linear-gradient(120deg, ${s.color}, ${s.color}dd 55%, #0f172a)`,
      }}
    >
      {s.logo ? (
        <img
          src={s.logo}
          alt="logo"
          className="shrink-0 bg-white object-contain p-1 shadow"
          style={{
            width: s.logoSize,
            height: s.logoSize,
            borderRadius: radius,
          }}
        />
      ) : (
        <div
          className="flex shrink-0 items-center justify-center bg-white/20 font-bold text-white"
          style={{
            width: s.logoSize,
            height: s.logoSize,
            borderRadius: radius,
            fontSize: s.logoSize / 2.5,
          }}
        >
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div
          className="font-extrabold uppercase leading-tight tracking-wide"
          style={{ fontSize: s.titleSize }}
        >
          {s.company}
        </div>
        {s.tagline && (
          <div className="text-sm italic opacity-90">{s.tagline}</div>
        )}
        <div className="mt-1 whitespace-pre-line text-sm opacity-90">
          {s.address}
        </div>
        <div className="text-sm opacity-90">
          Ph: {s.phone}
          {s.gstin && ` | GSTIN: ${s.gstin}`}
        </div>
      </div>
    </div>
  );
}
