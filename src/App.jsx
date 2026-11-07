import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import { OWNER } from "./config";
import { billPresets } from "./presets";
import { createShare, LinkManager, ImageInput, readImage } from "./extras";

/* ---------- country presets ---------- */
const COUNTRIES = {
  IN: {
    name: "India",
    currency: "₹",
    locale: "en-IN",
    taxName: "GST",
    gst: 18,
    idLabel: "GSTIN",
    unit: "Rupees",
    sub: "Paise",
  },
  AE: {
    name: "UAE",
    currency: "AED",
    locale: "en-AE",
    taxName: "VAT",
    gst: 5,
    idLabel: "TRN",
    unit: "Dirhams",
    sub: "Fils",
  },
  US: {
    name: "USA",
    currency: "$",
    locale: "en-US",
    taxName: "Sales Tax",
    gst: 8,
    idLabel: "EIN",
    unit: "Dollars",
    sub: "Cents",
  },
  GB: {
    name: "UK",
    currency: "£",
    locale: "en-GB",
    taxName: "VAT",
    gst: 20,
    idLabel: "VAT No",
    unit: "Pounds",
    sub: "Pence",
  },
  SG: {
    name: "Singapore",
    currency: "S$",
    locale: "en-SG",
    taxName: "GST",
    gst: 9,
    idLabel: "UEN",
    unit: "Dollars",
    sub: "Cents",
  },
};
const TPLS = [
  ["modern", "Modern"],
  ["classic", "Classic"],
  ["minimal", "Minimal"],
  ["elegant", "Elegant"],
];
const SWATCHES = [
  "#14365d",
  "#0f766e",
  "#7c2d12",
  "#6d28d9",
  "#be123c",
  "#111827",
];
const GOLD = "#d4b06a";

/* ---------- amount in words ---------- */
function toWords(n, indian, c) {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const two = (x) =>
    x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? "-" + a[x % 10] : "");
  const three = (x) =>
    (x >= 100
      ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " : "")
      : "") + (x % 100 ? two(x % 100) : "");
  const scales = indian
    ? [
        [1e7, "Crore"],
        [1e5, "Lakh"],
        [1e3, "Thousand"],
      ]
    : [
        [1e9, "Billion"],
        [1e6, "Million"],
        [1e3, "Thousand"],
      ];
  const cents = Math.round((n || 0) * 100);
  let int = Math.floor(cents / 100);
  const frac = cents % 100;
  const out = [];
  for (const [v, name] of scales)
    if (int >= v) {
      out.push(three(Math.floor(int / v)) + " " + name);
      int %= v;
    }
  if (int > 0) out.push(three(int));
  const main = out.length ? out.join(" ") : "Zero";
  return `${c.unit} ${main}${frac ? " and " + two(frac) + " " + c.sub : ""} Only`;
}

const DEFAULTS = {
  company: "Your Company Name",
  tagline: "Quality Welding Works",
  logo: "",
  logoShape: "rounded",
  logoSize: 64,
  address: "Street, City - 560001",
  phone: "9999999999",
  gstin: "",
  country: "IN",
  idLabel: "GSTIN",
  taxName: "GST",
  locale: "en-IN",
  tpl: "modern",
  color: "#14365d",
  titleSize: 26,
  textSize: 14,
  currency: "₹",
  gst: 18,
  showGst: true,
  footer: "Thank you for your business.",
  terms: "Payment within 7 days of delivery.",
  bank: "",
  pay: "",
  sign: "",
  wmOn: false,
  wmMode: "text",
  wmText: "ORIGINAL",
  wmImg: "",
  wmOpacity: 8,
  types: {
    bill: { on: true, title: "INVOICE", prefix: "INV", rates: true },
    quote: { on: true, title: "QUOTATION", prefix: "QT", rates: true },
    dc: { on: true, title: "DELIVERY CHALLAN", prefix: "DC", rates: false },
  },
};

function load(shared) {
  let s = DEFAULTS;
  try {
    const x = JSON.parse(localStorage.getItem("bill-settings"));
    if (x) s = { ...DEFAULTS, ...x, types: { ...DEFAULTS.types, ...x.types } };
  } catch {}
  const slug = location.pathname.split("/")[2];
  const p = billPresets[slug];
  if (p) s = { ...s, ...p, types: { ...s.types, ...(p.types || {}) } };
  if (shared)
    s = { ...s, ...shared, types: { ...s.types, ...(shared.types || {}) } };
  return s;
}

function useLS(key, init) {
  const [v, setV] = useState(() => {
    try {
      const x = JSON.parse(localStorage.getItem(key));
      return x ?? init;
    } catch {
      return init;
    }
  });
  const set = (n) => {
    setV(n);
    try {
      localStorage.setItem(key, JSON.stringify(n));
    } catch {
      alert("Storage is full. Use smaller images.");
    }
  };
  return [v, set];
}

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n) =>
  new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
// NOTE: Field is a div (not a label) so buttons inside it always work
const Field = ({ label, children }) => (
  <div className="block text-xs font-medium text-slate-600">
    {label}
    <div className="mt-1">{children}</div>
  </div>
);
const inp = "w-full rounded border border-slate-300 px-2 py-2 text-sm bg-white";
const H = ({ children }) => (
  <h3 className="border-t pt-3 text-sm font-bold text-slate-800">{children}</h3>
);

/* ---------- drawing pad ---------- */
function Sketch({ onSave }) {
  const ref = useRef();
  const drawing = useRef(false);
  const [col, setCol] = useState("#000000");
  const clear = () => {
    const c = ref.current,
      x = c.getContext("2d");
    x.fillStyle = "#fff";
    x.fillRect(0, 0, c.width, c.height);
  };
  useEffect(clear, []);
  const pos = (e) => {
    const c = ref.current,
      r = c.getBoundingClientRect();
    return [
      ((e.clientX - r.left) * c.width) / r.width,
      ((e.clientY - r.top) * c.height) / r.height,
    ];
  };
  const down = (e) => {
    drawing.current = true;
    const x = ref.current.getContext("2d");
    const [a, b] = pos(e);
    x.beginPath();
    x.moveTo(a, b);
    ref.current.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const x = ref.current.getContext("2d");
    const [a, b] = pos(e);
    x.lineWidth = 3;
    x.lineCap = "round";
    x.strokeStyle = col;
    x.lineTo(a, b);
    x.stroke();
  };
  const up = () => (drawing.current = false);
  return (
    <div className="space-y-2">
      <canvas
        ref={ref}
        width={800}
        height={500}
        className="w-full rounded border border-slate-400 bg-white"
        style={{ touchAction: "none" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={col}
          onChange={(e) => setCol(e.target.value)}
          className="h-9 w-12"
        />
        <button onClick={clear} className="rounded border px-3 py-2 text-sm">
          Clear
        </button>
        <button
          onClick={() => {
            onSave(ref.current.toDataURL("image/jpeg", 0.8));
            clear();
          }}
          className="ml-auto rounded bg-slate-900 px-3 py-2 text-sm text-white"
        >
          Add to document
        </button>
      </div>
    </div>
  );
}

/* ================= MAIN APP ================= */
export default function App({ shared }) {
  const [s, setS] = useState(() => load(shared));
  const [view, setView] = useState("doc");
  const [preview, setPreview] = useState(false);
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [askPass, setAskPass] = useState(false);
  const [passIn, setPassIn] = useState("");
  const [savedPass, setSavedPass] = useLS("bill-pass", "");
  const PASS = savedPass || OWNER.password;

  const [type, setType] = useState("bill");
  const [no, setNo] = useState(1);
  const [date, setDate] = useState(today());
  const [due, setDue] = useState(inDays(7));
  const [status, setStatus] = useState("Unpaid");
  const [cust, setCust] = useState({ name: "", address: "", phone: "" });
  const [items, setItems] = useState([
    { d: "Main gate fabrication (MS, powder coated)", q: 1, r: 48000 },
    { d: "Installation and finishing", q: 1, r: 6500 },
  ]);
  const [plans, setPlans] = useState([]);
  const [qr, setQr] = useState("");

  const [acc, setAcc] = useLS("bill-accounts", []);
  const [af, setAf] = useState({
    kind: "in",
    amount: "",
    note: "",
    date: today(),
  });
  const [filter, setFilter] = useState("all");

  const save = (n) => {
    setS(n);
    try {
      localStorage.setItem("bill-settings", JSON.stringify(n));
    } catch {
      alert("Storage is full. Use smaller images.");
    }
  };
  const set = (k, v) => save({ ...s, [k]: v });
  const setT = (t, k, v) =>
    save({ ...s, types: { ...s.types, [t]: { ...s.types[t], [k]: v } } });
  const enabled = Object.keys(s.types).filter((t) => s.types[t].on);
  const cur = s.types[type]?.on ? type : enabled[0] || "bill";
  const T = s.types[cur];
  const showRates = T.rates;
  const tpl = s.tpl || "modern";
  const cinfo = COUNTRIES[s.country] || COUNTRIES.IN;

  const upItem = (i, k, v) =>
    setItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const sub = items.reduce((a, it) => a + (+it.q || 0) * (+it.r || 0), 0);
  const gstAmt = s.showGst ? (sub * s.gst) / 100 : 0;
  const total = sub + gstAmt;
  const money = (n) =>
    s.currency +
    (s.currency.length > 1 ? " " : "") +
    n.toLocaleString(s.locale || "en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(s.locale || "en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  // scan-to-pay QR (UPI id for India, or any payment link)
  const payLink = !s.pay
    ? ""
    : s.pay.startsWith("http")
      ? s.pay
      : s.pay.includes("@") && s.country === "IN"
        ? `upi://pay?pa=${encodeURIComponent(s.pay)}&pn=${encodeURIComponent(s.company)}&am=${total.toFixed(2)}&cu=INR`
        : s.pay;
  useEffect(() => {
    if (!payLink) return setQr("");
    QRCode.toDataURL(payLink, { width: 240, margin: 1 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [payLink]);
  // Preview/PDF: show the full A4 layout on phones (auto-shrinks to fit)
  useEffect(() => {
    let m = document.querySelector('meta[name="viewport"]');
    if (!m) {
      m = document.createElement("meta");
      m.name = "viewport";
      document.head.appendChild(m);
    }
    const normal = "width=device-width, initial-scale=1";
    m.setAttribute("content", preview ? "width=800" : normal);
    return () => m.setAttribute("content", normal);
  }, [preview]);
  const cashIn = acc
    .filter((e) => e.kind === "in")
    .reduce((a, e) => a + e.amount, 0);
  const cashOut = acc
    .filter((e) => e.kind === "out")
    .reduce((a, e) => a + e.amount, 0);
  const balance = cashIn - cashOut;
  const shown = acc
    .filter((e) => filter === "all" || e.kind === filter)
    .sort((a, b) => b.date.localeCompare(a.date));
  const months = (() => {
    const m = {};
    acc.forEach((e) => {
      const k = e.date.slice(0, 7);
      m[k] = m[k] || { in: 0, out: 0 };
      m[k][e.kind] += e.amount;
    });
    return Object.keys(m)
      .sort()
      .slice(-6)
      .map((k) => ({ k, ...m[k] }));
  })();
  const maxM = Math.max(1, ...months.flatMap((m) => [m.in, m.out]));

  const tryOpenSettings = () => {
    if (unlocked) setOpen(true);
    else {
      setPassIn("");
      setAskPass(true);
    }
  };
  const checkPass = () => {
    if (passIn === PASS) {
      setUnlocked(true);
      setAskPass(false);
      setOpen(true);
    } else alert("Wrong password");
  };
  const copyLink = async () => {
    try {
      const url = await createShare("bill", "Customer", s);
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
      alert("Short link copied!\n\n" + url);
    } catch {
      alert("Could not create link. Check Supabase keys in extras.jsx");
    }
  };
  const changePass = () => {
    const n = prompt("Enter new password (min 4 characters):");
    if (n && n.length >= 4) {
      setSavedPass(n);
      alert("Password changed");
    } else if (n) alert("Too short");
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    let rows;
    if (view === "doc") {
      rows = [
        [s.company],
        [s.tagline],
        [s.address],
        ["Ph: " + s.phone + (s.gstin ? `  ${s.idLabel}: ${s.gstin}` : "")],
        [],
        [T.title, T.prefix + "-" + no],
        ["Date", date],
        ["Customer", cust.name],
        ["Address", cust.address],
        ["Phone", cust.phone],
        [],
        showRates
          ? ["#", "Description", "Qty", "Rate", "Amount"]
          : ["#", "Description", "Qty"],
        ...items.map((it, i) =>
          showRates
            ? [i + 1, it.d, +it.q || 0, +it.r || 0, (+it.q || 0) * (+it.r || 0)]
            : [i + 1, it.d, +it.q || 0],
        ),
      ];
      if (showRates) {
        rows.push([], ["", "", "", "Subtotal", sub]);
        if (s.showGst)
          rows.push(["", "", "", `${s.taxName} ${s.gst}%`, gstAmt]);
        rows.push(["", "", "", "TOTAL", total]);
      }
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(rows),
        "Document",
      );
      XLSX.writeFile(wb, `${T.prefix}-${no}.xlsx`);
    } else {
      rows = [
        [s.company + " - Accounts"],
        [],
        ["Date", "Type", "Details", "Cash In", "Cash Out"],
        ...[...acc]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((e) => [
            e.date,
            e.kind === "in" ? "Cash In" : "Cash Out",
            e.note,
            e.kind === "in" ? e.amount : "",
            e.kind === "out" ? e.amount : "",
          ]),
        [],
        ["", "", "TOTAL", cashIn, cashOut],
        ["", "", "BALANCE", balance],
      ];
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(rows),
        "Accounts",
      );
      XLSX.writeFile(wb, "accounts.xlsx");
    }
  };

  const addEntry = () => {
    const a = +af.amount;
    if (!a || a <= 0) return alert("Enter amount");
    setAcc([
      ...acc,
      {
        id: Date.now(),
        kind: af.kind,
        amount: a,
        note: af.note,
        date: af.date,
      },
    ]);
    setAf({ ...af, amount: "", note: "" });
  };

  const wa = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(OWNER.message)}`;
  const radius =
    s.logoShape === "round"
      ? "9999px"
      : s.logoShape === "rounded"
        ? "12px"
        : "0";
  const initials = (s.company || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const tf = (label, k, props = {}) => (
    <Field label={label}>
      <input
        className={inp}
        value={s[k] ?? ""}
        onChange={(e) => set(k, e.target.value)}
        {...props}
      />
    </Field>
  );
  const range = (label, k, min, max) => (
    <Field label={`${label}: ${s[k]}`}>
      <input
        type="range"
        min={min}
        max={max}
        className="w-full"
        value={s[k]}
        onChange={(e) => set(k, +e.target.value)}
      />
    </Field>
  );
  const applyCountry = (k) => {
    const c = COUNTRIES[k];
    save({
      ...s,
      country: k,
      currency: c.currency,
      locale: c.locale,
      taxName: c.taxName,
      gst: c.gst,
      idLabel: c.idLabel,
    });
  };

  /* ================= THE PAPER ================= */
  const paper = (ed) => {
    const dash = ed
      ? "border-b border-dashed border-slate-300 bg-transparent outline-none"
      : "bg-transparent outline-none";
    const accent = tpl === "elegant" ? GOLD : s.color;
    const ink = tpl === "elegant" ? "#111" : s.color;

    const logoEl = (onDark) =>
      s.logo ? (
        <img
          src={s.logo}
          alt="logo"
          className={
            "shrink-0 object-contain " + (onDark ? "bg-white p-1" : "")
          }
          style={{
            width: s.logoSize,
            height: s.logoSize,
            borderRadius: radius,
          }}
        />
      ) : (
        <div
          className="font-display flex shrink-0 items-center justify-center font-bold text-white"
          style={{
            width: s.logoSize,
            height: s.logoSize,
            borderRadius: radius,
            background: onDark ? "rgba(255,255,255,.18)" : s.color,
            fontSize: s.logoSize / 2.4,
          }}
        >
          {initials}
        </div>
      );
    const contact = [
      s.address && (
        <span key="a" className="whitespace-pre-line">
          {s.address}
        </span>
      ),
      s.phone && <span key="p">{s.phone}</span>,
      s.gstin && (
        <span key="g">
          {s.idLabel}: {s.gstin}
        </span>
      ),
    ].filter(Boolean);

    const header = {
      modern: (
        <div
          className="px-5 py-6 text-white sm:px-10"
          style={{
            background: `linear-gradient(120deg, ${s.color}, ${s.color}cc 55%, #0f172a)`,
          }}
        >
          <div className="flex items-center gap-4">
            {logoEl(true)}
            <div className="min-w-0 flex-1">
              <div
                className="font-display font-bold leading-tight"
                style={{ fontSize: s.titleSize }}
              >
                {s.company}
              </div>
              {s.tagline && (
                <div className="mt-0.5 text-[0.72em] uppercase tracking-[0.22em] opacity-80">
                  {s.tagline}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/20 pt-3 text-[0.85em] opacity-90">
            {contact}
          </div>
        </div>
      ),
      classic: (
        <div className="px-5 pt-8 text-center sm:px-10">
          <div className="flex justify-center">{logoEl(false)}</div>
          <div
            className="font-display mt-3 font-bold uppercase tracking-[0.12em]"
            style={{ color: s.color, fontSize: s.titleSize }}
          >
            {s.company}
          </div>
          {s.tagline && (
            <div className="mt-0.5 italic text-slate-500">{s.tagline}</div>
          )}
          <div
            className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 border-y-4 border-double py-2 text-[0.85em] text-slate-600"
            style={{ borderColor: s.color }}
          >
            {contact}
          </div>
        </div>
      ),
      minimal: (
        <div className="px-5 pt-8 sm:px-10">
          <div className="flex items-center gap-3">
            {logoEl(false)}
            <div>
              <div
                className="font-semibold leading-tight text-slate-900"
                style={{ fontSize: s.titleSize * 0.85 }}
              >
                {s.company}
              </div>
              {s.tagline && (
                <div className="text-[0.8em] text-slate-500">{s.tagline}</div>
              )}
            </div>
          </div>
          <div
            className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t pt-2 text-[0.82em] text-slate-500"
            style={{ borderColor: s.color }}
          >
            {contact}
          </div>
        </div>
      ),
      elegant: (
        <div className="px-5 py-7 sm:px-10" style={{ background: "#0b0b0f" }}>
          <div className="flex items-center gap-4">
            {logoEl(true)}
            <div className="min-w-0 flex-1">
              <div
                className="font-display font-bold leading-tight"
                style={{ color: GOLD, fontSize: s.titleSize }}
              >
                {s.company}
              </div>
              {s.tagline && (
                <div className="mt-0.5 text-[0.72em] uppercase tracking-[0.25em] text-white/60">
                  {s.tagline}
                </div>
              )}
            </div>
          </div>
          <div
            className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-[0.85em] text-white/70"
            style={{ borderColor: GOLD + "55" }}
          >
            {contact}
          </div>
        </div>
      ),
    }[tpl];

    const billBox = {
      modern: { background: s.color + "0d", borderRadius: 10 },
      classic: { border: "1px solid #111" },
      minimal: { borderLeft: `3px solid ${s.color}`, paddingLeft: 14 },
      elegant: { background: "#f8f6f1", borderLeft: `3px solid ${GOLD}` },
    }[tpl];
    const thStyle = {
      modern: { background: s.color + "14", color: s.color },
      classic: {
        borderTop: "2px solid #111",
        borderBottom: "2px solid #111",
        color: "#111",
      },
      minimal: { borderBottom: "1px solid #94a3b8", color: "#64748b" },
      elegant: { background: "#0b0b0f", color: GOLD },
    }[tpl];
    const totBox = {
      modern: { background: s.color, color: "#fff", borderRadius: 10 },
      classic: {
        borderTop: "2px solid #111",
        borderBottom: "2px solid #111",
        color: "#111",
      },
      minimal: { borderTop: `2px solid ${s.color}`, color: s.color },
      elegant: { background: "#0b0b0f", color: GOLD, borderRadius: 4 },
    }[tpl];

    const meta = (
      <div
        className={
          "w-full text-[0.92em] leading-relaxed text-slate-600 sm:w-auto " +
          (tpl === "classic" ? "text-center" : "text-left sm:text-right")
        }
      >
        <div>
          <span className="text-slate-400">No.</span>{" "}
          <b className="text-slate-900">{T.prefix}-</b>
          {ed ? (
            <input
              type="number"
              className={dash + " w-14 font-bold text-slate-900"}
              value={no}
              onChange={(e) => setNo(e.target.value)}
            />
          ) : (
            <b className="text-slate-900">{no}</b>
          )}
        </div>
        <div>
          <span className="text-slate-400">Date</span>{" "}
          {ed ? (
            <input
              type="date"
              className={dash}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          ) : (
            <b className="text-slate-900">{fmtDate(date)}</b>
          )}
        </div>
        {showRates && (
          <div>
            <span className="text-slate-400">
              {cur === "quote" ? "Valid till" : "Due"}
            </span>{" "}
            {ed ? (
              <input
                type="date"
                className={dash}
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            ) : (
              <b className="text-slate-900">{fmtDate(due)}</b>
            )}
          </div>
        )}
        {ed && cur === "bill" && (
          <div>
            <span className="text-slate-400">Status</span>{" "}
            <select
              className={dash}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Unpaid</option>
              <option>Paid</option>
            </select>
          </div>
        )}
      </div>
    );

    return (
      <div
        className="relative overflow-hidden bg-white shadow-[0_18px_50px_-18px_rgba(15,23,42,.35)] ring-1 ring-slate-200/70 print:shadow-none print:ring-0"
        style={{ fontSize: s.textSize }}
      >
        {header}
        {s.wmOn && (
          <div
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
            style={{ opacity: s.wmOpacity / 100 }}
          >
            {s.wmMode === "img" && s.wmImg ? (
              <img
                src={s.wmImg}
                alt=""
                className="max-h-[70%] max-w-[70%] object-contain"
              />
            ) : (
              <div
                className="whitespace-nowrap font-black"
                style={{
                  fontSize: "clamp(26px,9vw,90px)",
                  transform: "rotate(-30deg)",
                  color: s.color,
                }}
              >
                {s.wmText}
              </div>
            )}
          </div>
        )}
        {view === "doc" && cur === "bill" && status === "Paid" && (
          <div
            className="pointer-events-none absolute right-6 top-[38%] z-0 -rotate-12 rounded-lg border-4 px-5 py-1 text-4xl font-black tracking-[0.2em] opacity-30 sm:right-16"
            style={{ borderColor: "#059669", color: "#059669" }}
          >
            PAID
          </div>
        )}

        <div className="relative z-10 px-5 pb-8 pt-2 sm:px-10 print:px-6">
          {view === "doc" ? (
            <>
              <div
                className={
                  "mt-7 flex flex-wrap gap-3 " +
                  (tpl === "classic"
                    ? "flex-col items-center text-center"
                    : "flex-col items-start sm:flex-row sm:items-end sm:justify-between")
                }
              >
                <h2
                  className="font-display text-[1.7em] font-bold leading-tight tracking-wide sm:text-[2.3em]"
                  style={{ color: ink }}
                >
                  {T.title}
                </h2>
                {meta}
              </div>
              {tpl === "elegant" && (
                <div className="mt-3 h-px" style={{ background: GOLD }} />
              )}

              <div className="mt-6 p-4" style={billBox}>
                <div
                  className="text-[0.7em] font-bold uppercase tracking-[0.2em]"
                  style={{
                    color:
                      tpl === "classic"
                        ? "#111"
                        : accent === GOLD
                          ? "#9a7b3c"
                          : s.color,
                  }}
                >
                  {cur === "dc"
                    ? "Deliver to"
                    : cur === "quote"
                      ? "Prepared for"
                      : "Billed to"}
                </div>
                {ed ? (
                  <>
                    <input
                      placeholder="Customer name"
                      className={dash + " mt-1 w-full font-semibold"}
                      value={cust.name}
                      onChange={(e) =>
                        setCust({ ...cust, name: e.target.value })
                      }
                    />
                    <input
                      placeholder="Address"
                      className={dash + " mt-1 w-full text-slate-600"}
                      value={cust.address}
                      onChange={(e) =>
                        setCust({ ...cust, address: e.target.value })
                      }
                    />
                    <input
                      placeholder="Phone"
                      className={dash + " mt-1 w-full text-slate-600"}
                      value={cust.phone}
                      onChange={(e) =>
                        setCust({ ...cust, phone: e.target.value })
                      }
                    />
                  </>
                ) : (
                  <>
                    <div className="mt-1 font-semibold">{cust.name || "—"}</div>
                    {cust.address && (
                      <div className="text-slate-600">{cust.address}</div>
                    )}
                    {cust.phone && (
                      <div className="text-slate-600">{cust.phone}</div>
                    )}
                  </>
                )}
              </div>

              {ed ? (
                <div className="mt-6">
                  <div
                    className="px-2 py-1.5 text-[0.7em] font-bold uppercase tracking-[0.2em]"
                    style={thStyle}
                  >
                    Items
                  </div>
                  {items.map((it, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-2.5"
                    >
                      <span className="w-5 text-center text-slate-400">
                        {i + 1}
                      </span>
                      <input
                        placeholder="Description"
                        className="min-w-0 flex-1 basis-40 rounded border border-slate-200 p-1.5"
                        value={it.d}
                        onChange={(e) => upItem(i, "d", e.target.value)}
                      />
                      <label className="text-xs text-slate-500">
                        Qty
                        <input
                          type="number"
                          inputMode="decimal"
                          className="ml-1 w-14 rounded border border-slate-200 p-1.5 text-sm"
                          value={it.q}
                          onChange={(e) => upItem(i, "q", e.target.value)}
                        />
                      </label>
                      {showRates && (
                        <>
                          <label className="text-xs text-slate-500">
                            Rate
                            <input
                              type="number"
                              inputMode="decimal"
                              className="ml-1 w-24 rounded border border-slate-200 p-1.5 text-right text-sm"
                              value={it.r}
                              onChange={(e) => upItem(i, "r", e.target.value)}
                            />
                          </label>
                          <span className="ml-auto min-w-[90px] text-right font-semibold tabular-nums">
                            {money((+it.q || 0) * (+it.r || 0))}
                          </span>
                        </>
                      )}
                      {unlocked && (
                        <button
                          className="px-2 text-red-600"
                          onClick={() =>
                            setItems(items.filter((_, j) => j !== i))
                          }
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setItems([...items, { d: "", q: 1, r: 0 }])}
                    className="mt-3 rounded-full border px-4 py-1.5 text-sm"
                  >
                    + Add item
                  </button>
                </div>
              ) : (
                <>
                  {/* PHONE VIEW: stacked list */}
                  <div className="mt-6 sm:hidden print:hidden">
                    <div
                      className="px-2 py-1.5 text-[0.7em] font-bold uppercase tracking-[0.2em]"
                      style={thStyle}
                    >
                      Items
                    </div>
                    {items.map((it, i) => (
                      <div
                        key={i}
                        className="border-b border-slate-100 py-3 [break-inside:avoid]"
                      >
                        <div className="flex gap-2">
                          <span className="text-slate-400">{i + 1}.</span>
                          <span className="font-medium">{it.d}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between pl-5 text-[0.9em] text-slate-600">
                          <span>
                            Qty {it.q}
                            {showRates && <> × {money(+it.r || 0)}</>}
                          </span>
                          {showRates && (
                            <b className="tabular-nums text-slate-900">
                              {money((+it.q || 0) * (+it.r || 0))}
                            </b>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BIG SCREEN + PRINT: normal table */}
                  <table className="mt-6 hidden w-full border-collapse sm:table print:table">
                    <thead>
                      <tr
                        className="text-[0.7em] uppercase tracking-[0.18em]"
                        style={thStyle}
                      >
                        <th className="w-8 px-2 py-2.5 text-left font-bold">
                          #
                        </th>
                        <th className="py-2.5 text-left font-bold">
                          Description
                        </th>
                        <th className="py-2.5 text-right font-bold">Qty</th>
                        {showRates && (
                          <>
                            <th className="py-2.5 text-right font-bold">
                              Rate
                            </th>
                            <th className="px-2 py-2.5 text-right font-bold">
                              Amount
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-100 [break-inside:avoid]"
                        >
                          <td className="px-2 py-3 text-slate-400">{i + 1}</td>
                          <td className="py-3 pr-2">{it.d}</td>
                          <td className="py-3 text-right tabular-nums">
                            {it.q}
                          </td>
                          {showRates && (
                            <>
                              <td className="py-3 text-right tabular-nums">
                                {money(+it.r || 0)}
                              </td>
                              <td className="px-2 py-3 text-right font-semibold tabular-nums">
                                {money((+it.q || 0) * (+it.r || 0))}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {showRates && (
                <>
                  <div className="ml-auto mt-5 w-full max-w-full text-[0.95em] sm:max-w-xs">
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{money(sub)}</span>
                    </div>
                    {s.showGst && (
                      <div className="flex justify-between py-1 text-slate-600">
                        <span>
                          {s.taxName} ({s.gst}%)
                        </span>
                        <span className="tabular-nums">{money(gstAmt)}</span>
                      </div>
                    )}
                    <div
                      className="mt-2 flex items-center justify-between px-3 py-3"
                      style={totBox}
                    >
                      <span className="text-[0.75em] font-bold uppercase tracking-[0.2em]">
                        Total
                      </span>
                      <span className="text-[1.35em] font-bold tabular-nums">
                        {money(total)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-[0.85em] text-slate-500">
                    <b className="text-slate-700">Amount in words:</b>{" "}
                    {toWords(total, s.locale === "en-IN", cinfo)}
                  </div>
                </>
              )}

              {(s.terms || s.bank || (qr && showRates)) && (
                <div className="mt-8 grid gap-5 text-[0.88em] text-slate-600 sm:grid-cols-3">
                  {s.terms && (
                    <div>
                      <div className="mb-1 text-[0.8em] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Terms
                      </div>
                      <div className="whitespace-pre-line">{s.terms}</div>
                    </div>
                  )}
                  {s.bank && (
                    <div>
                      <div className="mb-1 text-[0.8em] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Payment details
                      </div>
                      <div className="whitespace-pre-line">{s.bank}</div>
                    </div>
                  )}
                  {qr && showRates && (
                    <div className="flex items-center gap-3">
                      <img src={qr} alt="pay" className="h-24 w-24" />
                      <div className="text-[0.9em]">
                        <b className="text-slate-800">Scan to pay</b>
                        <div>{money(total)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-12 flex items-end justify-between gap-4">
                <div className="text-[0.85em] italic text-slate-400">
                  {s.footer}
                </div>
                <div className="shrink-0 text-center">
                  <div className="text-[0.75em] text-slate-400">
                    For {s.company}
                  </div>
                  {s.sign ? (
                    <img
                      src={s.sign}
                      alt=""
                      className="mx-auto h-12 object-contain"
                    />
                  ) : (
                    <div className="h-10" />
                  )}
                  <div className="border-t border-slate-400 px-8 pt-1 text-[0.8em] text-slate-500">
                    Authorised signature
                  </div>
                </div>
              </div>

              {plans.length > 0 && (
                <div className="mt-8 [break-before:page]">
                  <div
                    className="font-display mb-2 text-lg font-bold"
                    style={{ color: ink }}
                  >
                    Drawing / Plan
                  </div>
                  <div className="space-y-3">
                    {plans.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt=""
                        className="w-full rounded border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h2
                className="font-display mt-7 text-[2.3em] font-bold leading-none tracking-wide"
                style={{ color: ink }}
              >
                ACCOUNTS STATEMENT
              </h2>

              {/* PHONE VIEW: stacked list */}
              <div className="mt-6 sm:hidden print:hidden">
                <div
                  className="px-2 py-1.5 text-[0.7em] font-bold uppercase tracking-[0.2em]"
                  style={thStyle}
                >
                  Entries
                </div>
                {[...acc]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((e) => (
                    <div
                      key={e.id}
                      className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 [break-inside:avoid]"
                    >
                      <div className="min-w-0">
                        <div className="font-medium">{e.note || "-"}</div>
                        <div className="text-[0.85em] text-slate-500">
                          {fmtDate(e.date)}
                        </div>
                      </div>
                      <div
                        className={
                          "shrink-0 font-semibold tabular-nums " +
                          (e.kind === "in"
                            ? "text-emerald-700"
                            : "text-red-600")
                        }
                      >
                        {e.kind === "in" ? "+" : "-"}
                        {money(e.amount)}
                      </div>
                    </div>
                  ))}
                <div className="flex justify-between py-2 text-[0.9em] font-bold">
                  <span>Total in</span>
                  <span className="tabular-nums">{money(cashIn)}</span>
                </div>
                <div className="flex justify-between py-2 text-[0.9em] font-bold">
                  <span>Total out</span>
                  <span className="tabular-nums">{money(cashOut)}</span>
                </div>
              </div>

              {/* BIG SCREEN + PRINT: normal table */}
              <table className="mt-6 hidden w-full border-collapse sm:table print:table">
                <thead>
                  <tr
                    className="text-[0.7em] uppercase tracking-[0.18em]"
                    style={thStyle}
                  >
                    <th className="px-2 py-2.5 text-left font-bold">Date</th>
                    <th className="py-2.5 text-left font-bold">Details</th>
                    <th className="py-2.5 text-right font-bold">Cash In</th>
                    <th className="px-2 py-2.5 text-right font-bold">
                      Cash Out
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...acc]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-slate-100 [break-inside:avoid]"
                      >
                        <td className="px-2 py-2.5">{fmtDate(e.date)}</td>
                        <td className="py-2.5">{e.note || "-"}</td>
                        <td className="py-2.5 text-right tabular-nums text-emerald-700">
                          {e.kind === "in" ? money(e.amount) : ""}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums text-red-600">
                          {e.kind === "out" ? money(e.amount) : ""}
                        </td>
                      </tr>
                    ))}
                  <tr className="font-bold">
                    <td className="px-2 py-3" colSpan={2}>
                      TOTAL
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {money(cashIn)}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">
                      {money(cashOut)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                className="ml-auto mt-4 flex w-full max-w-full items-center justify-between px-3 py-3 sm:max-w-xs"
                style={
                  balance >= 0
                    ? totBox
                    : { background: "#dc2626", color: "#fff", borderRadius: 8 }
                }
              >
                <span className="text-[0.75em] font-bold uppercase tracking-[0.2em]">
                  Balance
                </span>
                <span className="text-[1.35em] font-bold tabular-nums">
                  {money(balance)}
                </span>
              </div>
              <div className="mt-10 text-[0.85em] italic text-slate-400">
                {s.footer}
              </div>
            </>
          )}
        </div>
        {(tpl === "modern" || tpl === "elegant") && (
          <div className="h-2" style={{ background: accent }} />
        )}
      </div>
    );
  };

  /* ================= PDF PREVIEW ================= */
  if (preview)
    return (
      <div className="min-h-screen bg-[#e9e7e1] pb-10 print:bg-white print:pb-0">
        <style>{`@page{size:A4;margin:10mm}@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{background:#fff}}`}</style>
        <div className="print:hidden sticky top-0 z-20 flex items-center gap-2 bg-slate-950 p-2.5 text-white">
          <button
            onClick={() => setPreview(false)}
            className="rounded-full bg-slate-800 px-4 py-2 text-xs"
          >
            ← Back
          </button>
          <b className="text-sm">PDF Preview</b>
          <button
            onClick={() => window.print()}
            className="ml-auto rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900"
          >
            ⬇ PDF
          </button>
          <button
            onClick={downloadExcel}
            className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold"
          >
            ⬇ Excel
          </button>
        </div>
        <div className="mx-auto mt-4 max-w-[800px] px-2 print:mt-0 print:max-w-none print:px-0">
          {paper(false)}
        </div>
      </div>
    );

  const tab = (active) =>
    "shrink-0 border-b-2 px-3 py-2 text-xs font-semibold tracking-wide transition " +
    (active ? "border-white text-white" : "border-transparent text-slate-400");

  return (
    <div className="min-h-screen bg-[#f2f0ea] pb-16">
      <div className="print:hidden sticky top-0 z-20 bg-slate-950 text-white shadow-lg">
        <div className="mx-auto max-w-5xl px-3 pt-2.5">
          <div className="flex items-center gap-2">
            <span className="font-display truncate text-base font-bold">
              {s.company}
            </span>
            <div className="ml-auto flex gap-2">
              {unlocked && (
                <>
                  <button
                    onClick={copyLink}
                    className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950"
                  >
                    Share link
                  </button>
                  <button
                    onClick={() => {
                      setUnlocked(false);
                      setOpen(false);
                    }}
                    className="rounded-full bg-slate-800 px-3 py-1.5 text-xs"
                  >
                    Lock
                  </button>
                </>
              )}
              {!shared && (
                <button
                  onClick={tryOpenSettings}
                  className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-slate-950"
                >
                  Settings
                </button>
              )}
            </div>
          </div>
          <div className="mt-1 flex gap-1 overflow-x-auto">
            {enabled.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setView("doc");
                }}
                className={tab(view === "doc" && cur === t)}
              >
                {s.types[t].title}
              </button>
            ))}
            <button
              onClick={() => setView("acc")}
              className={tab(view === "acc")}
            >
              ACCOUNTS
            </button>
          </div>
        </div>
      </div>

      {askPass && (
        <div className="print:hidden fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs space-y-3 rounded-2xl bg-white p-5">
            <h2 className="font-bold">Owner login</h2>
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
        <div className="print:hidden fixed inset-0 z-30 flex justify-end bg-black/50">
          <aside className="h-full w-full space-y-3 overflow-y-auto bg-white p-4 sm:w-96">
            <div className="sticky top-0 z-10 -mx-4 -mt-4 flex items-center justify-between bg-white p-4 shadow-sm">
              <h2 className="font-bold">Settings (Owner)</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Done ✓
              </button>
            </div>

            <H>Business details</H>
            {tf("Company name", "company")}
            {tf("Tagline", "tagline")}
            <Field label="Address">
              <textarea
                className={inp}
                rows={2}
                value={s.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              {tf("Phone", "phone")}
              {tf(s.idLabel + " (tax ID)", "gstin")}
            </div>

            <H>Invoice style</H>
            <div className="grid grid-cols-2 gap-2">
              {TPLS.map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => set("tpl", k)}
                  className={
                    "rounded border py-2 text-sm " +
                    (tpl === k
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "")
                  }
                >
                  {l}
                </button>
              ))}
            </div>

            <H>Country & tax (one tap)</H>
            <Field label="Country">
              <select
                className={inp}
                value={s.country}
                onChange={(e) => applyCountry(e.target.value)}
              >
                {Object.entries(COUNTRIES).map(([k, c]) => (
                  <option key={k} value={k}>
                    {c.name} — {c.currency}, {c.taxName}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.showGst}
                onChange={(e) => set("showGst", e.target.checked)}
              />{" "}
              Add {s.taxName}
            </label>
            {s.showGst && (
              <div className="grid grid-cols-2 gap-2">
                {tf("Tax name", "taxName")}
                <Field label="Tax %">
                  <input
                    type="number"
                    className={inp}
                    value={s.gst}
                    onChange={(e) => set("gst", +e.target.value)}
                  />
                </Field>
              </div>
            )}

            <H>Logo</H>
            <ImageInput
              onFile={(f) =>
                readImage(f, 400, "image/png", (d) => set("logo", d))
              }
            />
            {s.logo && (
              <button
                className="text-xs text-red-600"
                onClick={() => set("logo", "")}
              >
                Remove logo
              </button>
            )}
            <Field label="Logo shape">
              <select
                className={inp}
                value={s.logoShape}
                onChange={(e) => set("logoShape", e.target.value)}
              >
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="round">Circle</option>
              </select>
            </Field>
            {range("Logo size", "logoSize", 40, 120)}

            <H>Signature (image)</H>
            <ImageInput
              onFile={(f) =>
                readImage(f, 400, "image/png", (d) => set("sign", d))
              }
            />
            {s.sign && (
              <button
                className="text-xs text-red-600"
                onClick={() => set("sign", "")}
              >
                Remove signature
              </button>
            )}

            <H>Watermark</H>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.wmOn}
                onChange={(e) => set("wmOn", e.target.checked)}
              />{" "}
              Show watermark
            </label>
            {s.wmOn && (
              <>
                <Field label="Type">
                  <select
                    className={inp}
                    value={s.wmMode}
                    onChange={(e) => set("wmMode", e.target.value)}
                  >
                    <option value="text">Text</option>
                    <option value="img">Image</option>
                  </select>
                </Field>
                {s.wmMode === "text" ? (
                  tf("Watermark text", "wmText")
                ) : (
                  <>
                    <ImageInput
                      onFile={(f) =>
                        readImage(f, 700, "image/png", (d) => set("wmImg", d))
                      }
                    />
                    {s.wmImg && (
                      <button
                        className="text-xs text-red-600"
                        onClick={() => set("wmImg", "")}
                      >
                        Remove image
                      </button>
                    )}
                  </>
                )}
                {range("Strength", "wmOpacity", 3, 40)}
              </>
            )}

            <H>Look & feel</H>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Brand colour">
                <input
                  type="color"
                  className="h-10 w-full"
                  value={s.color}
                  onChange={(e) => set("color", e.target.value)}
                />
              </Field>
              {tf("Currency symbol", "currency")}
            </div>
            {range("Heading size", "titleSize", 18, 40)}
            {range("Text size", "textSize", 11, 18)}

            <H>Terms, payment & footer</H>
            <Field label="Terms">
              <textarea
                className={inp}
                rows={2}
                value={s.terms}
                onChange={(e) => set("terms", e.target.value)}
              />
            </Field>
            <Field label="Bank / payment details">
              <textarea
                className={inp}
                rows={3}
                placeholder={"Bank: HDFC\nA/c: 0000\nIFSC: HDFC000"}
                value={s.bank}
                onChange={(e) => set("bank", e.target.value)}
              />
            </Field>
            {tf("UPI ID or payment link (shows a Scan-to-pay QR)", "pay", {
              placeholder: "name@upi  or  https://paypal.me/yourname",
            })}
            {tf("Footer message", "footer")}

            <H>Document types</H>
            {Object.keys(s.types).map((t) => (
              <div
                key={t}
                className="space-y-2 rounded border border-slate-200 p-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={s.types[t].on}
                    onChange={(e) => setT(t, "on", e.target.checked)}
                  />{" "}
                  Use this
                </label>
                <input
                  className={inp}
                  value={s.types[t].title}
                  onChange={(e) => setT(t, "title", e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <input
                    className={inp + " w-24"}
                    value={s.types[t].prefix}
                    onChange={(e) => setT(t, "prefix", e.target.value)}
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={s.types[t].rates}
                      onChange={(e) => setT(t, "rates", e.target.checked)}
                    />{" "}
                    Show rate & amount
                  </label>
                </div>
              </div>
            ))}

            <H>Drawing / Plan (this document)</H>
            <ImageInput
              onFile={(f) =>
                readImage(f, 1000, "image/jpeg", (d) =>
                  setPlans((p) => [...p, d]),
                )
              }
            />
            <p className="text-xs text-slate-500">Or draw with your finger:</p>
            <Sketch onSave={(d) => setPlans((p) => [...p, d])} />
            {plans.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {plans.map((p, i) => (
                  <div key={i} className="relative">
                    <img
                      src={p}
                      alt=""
                      className="h-20 w-full rounded border object-cover"
                    />
                    <button
                      onClick={() => setPlans(plans.filter((_, j) => j !== i))}
                      className="absolute right-0 top-0 rounded-bl bg-red-600 px-2 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <H>Owner tools</H>
            <button
              onClick={changePass}
              className="w-full rounded border py-2 text-sm"
            >
              Change password
            </button>
            <H>Customer links</H>
            <LinkManager app="bill" getData={() => s} />
            <button
              onClick={() => {
                if (confirm("Delete ALL settings and accounts data?")) {
                  localStorage.removeItem("bill-settings");
                  localStorage.removeItem("bill-accounts");
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

      <div className="mx-auto max-w-5xl p-2 sm:p-4">
        {view === "doc" && (
          <main>
            {/* live style + colour picker: great for showing prospects */}
            <div className="print:hidden mb-3 space-y-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Choose style
              </div>
              <div className="flex flex-wrap gap-2">
                {TPLS.map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => set("tpl", k)}
                    className={
                      "rounded-full px-4 py-1.5 text-xs font-semibold " +
                      (tpl === k ? "bg-slate-950 text-white" : "bg-slate-100")
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Colour
                </span>
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => set("color", c)}
                    aria-label={c}
                    className="h-6 w-6 rounded-full ring-2 ring-offset-2"
                    style={{
                      background: c,
                      "--tw-ring-color": s.color === c ? c : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            {paper(true)}
            <div className="print:hidden mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => setPreview(true)}
                className="rounded-full bg-slate-950 py-3 text-sm font-bold text-white"
              >
                Preview
              </button>
              <button
                onClick={() => setPreview(true)}
                className="rounded-full bg-white py-3 text-sm font-bold ring-1 ring-slate-300"
              >
                PDF
              </button>
              <button
                onClick={downloadExcel}
                className="rounded-full bg-white py-3 text-sm font-bold ring-1 ring-slate-300"
              >
                Excel
              </button>
            </div>
          </main>
        )}

        {view === "acc" && (
          <main className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Cash in", money(cashIn), "#059669"],
                ["Cash out", money(cashOut), "#dc2626"],
                ["Balance", money(balance), balance >= 0 ? s.color : "#dc2626"],
              ].map(([l, v, c]) => (
                <div
                  key={l}
                  className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {l}
                  </div>
                  <div
                    className="mt-1 text-sm font-bold tabular-nums sm:text-base"
                    style={{ color: c }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>

            {months.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Last months
                </div>
                <svg viewBox="0 0 320 130" className="mt-2 w-full">
                  {months.map((m, i) => {
                    const x = 12 + i * 50;
                    const hi = (m.in / maxM) * 85,
                      ho = (m.out / maxM) * 85;
                    return (
                      <g key={m.k}>
                        <rect
                          x={x}
                          y={100 - hi}
                          width="16"
                          height={hi}
                          rx="3"
                          fill="#059669"
                        />
                        <rect
                          x={x + 18}
                          y={100 - ho}
                          width="16"
                          height={ho}
                          rx="3"
                          fill="#dc2626"
                        />
                        <text
                          x={x + 17}
                          y="116"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#94a3b8"
                        >
                          {m.k.slice(5)}/{m.k.slice(2, 4)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex gap-4 text-[11px] text-slate-500">
                  <span>
                    <b className="text-emerald-600">■</b> In
                  </span>
                  <span>
                    <b className="text-red-600">■</b> Out
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAf({ ...af, kind: "in" })}
                  className={
                    "rounded-full py-2 text-sm font-semibold " +
                    (af.kind === "in"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100")
                  }
                >
                  ＋ Cash In
                </button>
                <button
                  onClick={() => setAf({ ...af, kind: "out" })}
                  className={
                    "rounded-full py-2 text-sm font-semibold " +
                    (af.kind === "out"
                      ? "bg-red-600 text-white"
                      : "bg-slate-100")
                  }
                >
                  － Cash Out
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Amount"
                  className={inp}
                  value={af.amount}
                  onChange={(e) => setAf({ ...af, amount: e.target.value })}
                />
                <input
                  type="date"
                  className={inp}
                  value={af.date}
                  onChange={(e) => setAf({ ...af, date: e.target.value })}
                />
              </div>
              <input
                placeholder="Details (e.g. Advance from Ravi, Material purchase)"
                className={inp}
                value={af.note}
                onChange={(e) => setAf({ ...af, note: e.target.value })}
              />
              <button
                onClick={addEntry}
                className="w-full rounded-full bg-slate-950 py-2.5 text-sm font-bold text-white"
              >
                Add entry
              </button>
            </div>

            <div className="flex gap-2">
              {[
                ["all", "All"],
                ["in", "Cash In"],
                ["out", "Cash Out"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={
                    "rounded-full px-4 py-1.5 text-xs font-semibold " +
                    (filter === k
                      ? "bg-slate-950 text-white"
                      : "bg-white ring-1 ring-slate-200")
                  }
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              {shown.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">
                  No entries yet. Add your first cash in / cash out above.
                </div>
              )}
              {shown.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 border-b border-slate-100 p-3 last:border-0"
                >
                  <div
                    className={
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white " +
                      (e.kind === "in" ? "bg-emerald-600" : "bg-red-600")
                    }
                  >
                    {e.kind === "in" ? "↓" : "↑"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {e.note || (e.kind === "in" ? "Cash In" : "Cash Out")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {fmtDate(e.date)}
                    </div>
                  </div>
                  <div
                    className={
                      "font-semibold tabular-nums " +
                      (e.kind === "in" ? "text-emerald-600" : "text-red-600")
                    }
                  >
                    {e.kind === "in" ? "+" : "-"}
                    {money(e.amount)}
                  </div>
                  {unlocked && (
                    <button
                      className="px-2 text-red-600"
                      onClick={() =>
                        confirm("Delete this entry?") &&
                        setAcc(acc.filter((x) => x.id !== e.id))
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPreview(true)}
                className="rounded-full bg-slate-950 py-3 text-sm font-bold text-white"
              >
                Preview / PDF
              </button>
              <button
                onClick={downloadExcel}
                className="rounded-full bg-white py-3 text-sm font-bold ring-1 ring-slate-300"
              >
                Excel
              </button>
            </div>
          </main>
        )}

        <div className="print:hidden mt-6 overflow-hidden rounded-3xl bg-slate-950 p-6 text-center text-white">
          <div className="font-display text-xl font-bold">
            Want this with your own business name?
          </div>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            {OWNER.offer}
          </p>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full bg-amber-400 px-7 py-2.5 text-sm font-bold text-slate-950"
          >
            Get a free demo →
          </a>
        </div>
      </div>
    </div>
  );
}
