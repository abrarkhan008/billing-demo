import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { OWNER } from "./config";


const DEFAULTS = {
  company: "Your Company Name",
  tagline: "Quality Welding Works",
  logo: "",
  logoShape: "rounded",
  logoSize: 80,
  address: "Street, City - 560001",
  phone: "9999999999",
  gstin: "",
  color: "#1d4ed8",
  titleSize: 26,
  textSize: 14,
  currency: "₹",
  gst: 18,
  showGst: true,
  footer: "Thank you for your business!",
  terms: "Payment within 7 days of delivery.",
  wmOn: false,
  wmMode: "text",
  wmText: "ORIGINAL",
  wmImg: "",
  wmOpacity: 10,
  types: {
    bill: { on: true, title: "BILL / INVOICE", prefix: "INV", rates: true },
    quote: { on: true, title: "QUOTATION", prefix: "QT", rates: true },
    dc: { on: true, title: "DELIVERY CHALLAN", prefix: "DC", rates: false },
  },
};

function load() {
  let s = DEFAULTS;
  try {
    const x = JSON.parse(localStorage.getItem("bill-settings"));
    if (x) s = { ...DEFAULTS, ...x, types: { ...DEFAULTS.types, ...x.types } };
  } catch {}
  const q = new URLSearchParams(location.search);
  ["company", "tagline", "address", "phone", "gstin", "color"].forEach(
    (k) => q.get(k) && (s = { ...s, [k]: q.get(k) }),
  );
  if (q.get("logo")) s = { ...s, logo: "/logos/" + q.get("logo") };
  return s;
}

/* ================= SMALL HELPERS ================= */
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
      alert("Phone storage is full. Use smaller images.");
    }
  };
  return [v, set];
}

// shrink images so phone storage does not fill up
function readImage(file, max, type, cb) {
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

const today = () => new Date().toISOString().slice(0, 10);
const Field = ({ label, children }) => (
  <label className="block text-xs font-medium text-slate-600">
    {label}
    <div className="mt-1">{children}</div>
  </label>
);
const inp = "w-full rounded border border-slate-300 px-2 py-2 text-sm bg-white";
const H = ({ children }) => (
  <h3 className="border-t pt-3 text-sm font-bold text-slate-800">{children}</h3>
);

/* ================= DRAWING PAD (finger / mouse) ================= */
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
  const up = () => {
    drawing.current = false;
  };
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
export default function App() {
  const [s, setS] = useState(load);
  const [view, setView] = useState("doc"); // doc | acc
  const [preview, setPreview] = useState(false);
  const [open, setOpen] = useState(false); // settings drawer
  const [unlocked, setUnlocked] = useState(false); // owner mode
  const [askPass, setAskPass] = useState(false);
  const [passIn, setPassIn] = useState("");
  const [savedPass, setSavedPass] = useLS("bill-pass", "");
  const PASS = savedPass || OWNER.password;

  const [type, setType] = useState("bill");
  const [no, setNo] = useState(1);
  const [date, setDate] = useState(today());
  const [cust, setCust] = useState({ name: "", address: "", phone: "" });
  const [items, setItems] = useState([
    { d: "Gate fabrication", q: 1, r: 5000 },
  ]);
  const [plans, setPlans] = useState([]); // drawings / plans for this document

  // accounts
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
      alert("Phone storage is full. Use smaller images.");
    }
  };
  const set = (k, v) => save({ ...s, [k]: v });
  const setT = (t, k, v) =>
    save({ ...s, types: { ...s.types, [t]: { ...s.types[t], [k]: v } } });
  const enabled = Object.keys(s.types).filter((t) => s.types[t].on);
  const cur = s.types[type]?.on ? type : enabled[0] || "bill";
  const T = s.types[cur];
  const showRates = T.rates;

  const upItem = (i, k, v) =>
    setItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const sub = items.reduce((a, it) => a + (+it.q || 0) * (+it.r || 0), 0);
  const gstAmt = s.showGst ? (sub * s.gst) / 100 : 0;
  const total = sub + gstAmt;
  const money = (n) =>
    s.currency +
    " " +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // accounts totals
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

  /* ---------- actions ---------- */
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
  const lock = () => {
    setUnlocked(false);
    setOpen(false);
  };

  const onLogo = (e) => {
    const f = e.target.files[0];
    if (f) readImage(f, 400, "image/png", (d) => set("logo", d));
  };
  const onWm = (e) => {
    const f = e.target.files[0];
    if (f) readImage(f, 700, "image/png", (d) => set("wmImg", d));
  };
  const onPlan = (e) => {
    Array.from(e.target.files).forEach((f) =>
      readImage(f, 1000, "image/jpeg", (d) => setPlans((p) => [...p, d])),
    );
    e.target.value = "";
  };

  const copyLink = () => {
    const p = new URLSearchParams();
    ["company", "tagline", "address", "phone", "gstin", "color"].forEach(
      (k) => s[k] && p.set(k, s[k]),
    );
    if (s.logo && !s.logo.startsWith("data:"))
      p.set("logo", s.logo.replace("/logos/", ""));
    const url = location.origin + "/?" + p.toString();
    navigator.clipboard?.writeText(url);
    alert(
      "Demo link copied:\n" +
        url +
        (s.logo.startsWith("data:")
          ? "\n\nNote: uploaded logo is not in the link. Put the logo file in public/logos/ and use ?logo=filename.png"
          : ""),
    );
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
        ["Ph: " + s.phone + (s.gstin ? "  GSTIN: " + s.gstin : "")],
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
        if (s.showGst) rows.push(["", "", "", "GST " + s.gst + "%", gstAmt]);
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
        ? "14px"
        : "0";
  const initials = (s.company || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* ================= UI ================= */
  /* ================= PDF PREVIEW SCREEN ================= */
  if (preview) {
    const isDoc = view === "doc";
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "");
    return (
      <div className="min-h-screen bg-slate-300 pb-10 print:bg-white print:pb-0">
        <style>{`
          @page { size: A4; margin: 10mm; }
          @media print {
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { background: #fff; }
            .page-break { break-before: page; }
            tr { break-inside: avoid; }
          }
        `}</style>

        {/* top bar (not printed) */}
        <div className="print:hidden sticky top-0 z-20 flex items-center gap-2 bg-slate-900 p-2 text-white shadow">
          <button
            onClick={() => setPreview(false)}
            className="rounded bg-slate-700 px-3 py-2 text-xs"
          >
            ← Back
          </button>
          <b className="text-sm">PDF Preview</b>
          <button
            onClick={() => window.print()}
            className="ml-auto rounded bg-emerald-500 px-3 py-2 text-xs font-semibold"
          >
            ⬇ PDF
          </button>
          <button
            onClick={downloadExcel}
            className="rounded bg-green-800 px-3 py-2 text-xs font-semibold"
          >
            ⬇ Excel
          </button>
        </div>

        <div className="mx-auto mt-3 max-w-[800px] px-2 print:mt-0 print:max-w-none print:px-0">
          <div
            className="relative overflow-hidden bg-white p-5 shadow-lg sm:p-8 print:p-0 print:shadow-none"
            style={{ fontSize: s.textSize }}
          >
            {/* watermark */}
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
                      fontSize: "clamp(40px, 14vw, 110px)",
                      transform: "rotate(-30deg)",
                      color: s.color,
                    }}
                  >
                    {s.wmText}
                  </div>
                )}
              </div>
            )}

            <div className="relative z-10">
              {/* ---------- letterhead ---------- */}
              <div
                className="flex items-center gap-4 border-b-4 pb-4"
                style={{ borderColor: s.color }}
              >
                {s.logo ? (
                  <img
                    src={s.logo}
                    alt="logo"
                    className="shrink-0 border border-slate-200 bg-white object-contain p-1"
                    style={{
                      width: s.logoSize,
                      height: s.logoSize,
                      borderRadius: radius,
                    }}
                  />
                ) : (
                  <div
                    className="flex shrink-0 items-center justify-center font-bold text-white"
                    style={{
                      width: s.logoSize,
                      height: s.logoSize,
                      borderRadius: radius,
                      background: s.color,
                      fontSize: s.logoSize / 2.5,
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className="font-extrabold uppercase leading-tight tracking-wide"
                    style={{ color: s.color, fontSize: s.titleSize }}
                  >
                    {s.company}
                  </div>
                  {s.tagline && (
                    <div className="font-medium italic text-slate-700">
                      {s.tagline}
                    </div>
                  )}
                  <div className="mt-1 whitespace-pre-line text-slate-600">
                    {s.address}
                  </div>
                  <div className="text-slate-600">
                    Ph: {s.phone}
                    {s.gstin && ` | GSTIN: ${s.gstin}`}
                  </div>
                </div>
              </div>

              {isDoc ? (
                <>
                  {/* ---------- title + number ---------- */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    <div
                      className="rounded px-4 py-1.5 font-bold tracking-wide text-white"
                      style={{
                        background: s.color,
                        fontSize: s.titleSize * 0.65,
                      }}
                    >
                      {T.title}
                    </div>
                    <div className="text-right">
                      <div>
                        <b>No:</b> {T.prefix}-{no}
                      </div>
                      <div>
                        <b>Date:</b> {fmtDate(date)}
                      </div>
                    </div>
                  </div>

                  {/* ---------- customer ---------- */}
                  <div
                    className="mt-4 rounded border-l-4 bg-slate-50 p-3"
                    style={{ borderColor: s.color }}
                  >
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      Billed To
                    </div>
                    <div className="font-bold">{cust.name || "—"}</div>
                    {cust.address && (
                      <div className="text-slate-600">{cust.address}</div>
                    )}
                    {cust.phone && (
                      <div className="text-slate-600">Ph: {cust.phone}</div>
                    )}
                  </div>

                  {/* ---------- items table ---------- */}
                  <table className="mt-5 w-full border-collapse">
                    <thead>
                      <tr
                        style={{ background: s.color }}
                        className="text-white"
                      >
                        <th className="w-8 p-2 text-left">#</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-right">Qty</th>
                        {showRates && (
                          <>
                            <th className="p-2 text-right">Rate</th>
                            <th className="p-2 text-right">Amount</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, i) => (
                        <tr
                          key={i}
                          className={i % 2 ? "bg-slate-50" : ""}
                          style={{ borderBottom: "1px solid #e2e8f0" }}
                        >
                          <td className="p-2 text-slate-500">{i + 1}</td>
                          <td className="p-2">{it.d}</td>
                          <td className="p-2 text-right">{it.q}</td>
                          {showRates && (
                            <>
                              <td className="p-2 text-right">
                                {money(+it.r || 0)}
                              </td>
                              <td className="p-2 text-right font-medium">
                                {money((+it.q || 0) * (+it.r || 0))}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* ---------- totals ---------- */}
                  {showRates && (
                    <div className="ml-auto mt-4 w-full max-w-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{money(sub)}</span>
                      </div>
                      {s.showGst && (
                        <div className="flex justify-between">
                          <span>GST ({s.gst}%)</span>
                          <span>{money(gstAmt)}</span>
                        </div>
                      )}
                      <div
                        className="flex justify-between rounded px-2 py-2 text-lg font-bold text-white"
                        style={{ background: s.color }}
                      >
                        <span>TOTAL</span>
                        <span>{money(total)}</span>
                      </div>
                    </div>
                  )}

                  {/* ---------- terms + signature ---------- */}
                  {s.terms && (
                    <div className="mt-8 text-slate-600">
                      <b>Terms & Conditions:</b>
                      <div className="whitespace-pre-line">{s.terms}</div>
                    </div>
                  )}
                  <div className="mt-12 flex items-end justify-between gap-4">
                    <div className="text-slate-500">{s.footer}</div>
                    <div className="shrink-0 text-center">
                      <div className="mb-8 text-xs text-slate-500">
                        For {s.company}
                      </div>
                      <div className="border-t border-slate-500 px-6 pt-1 text-sm">
                        Authorised Signature
                      </div>
                    </div>
                  </div>

                  {/* ---------- drawings ---------- */}
                  {plans.length > 0 && (
                    <div className="page-break mt-8">
                      <div
                        className="mb-2 text-lg font-bold"
                        style={{ color: s.color }}
                      >
                        Drawing / Plan
                      </div>
                      <div className="space-y-3">
                        {plans.map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            alt={"plan " + (i + 1)}
                            className="w-full rounded border border-slate-300"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* ---------- ACCOUNTS REPORT ---------- */}
                  <div
                    className="mt-5 inline-block rounded px-4 py-1.5 font-bold text-white"
                    style={{
                      background: s.color,
                      fontSize: s.titleSize * 0.65,
                    }}
                  >
                    ACCOUNTS STATEMENT
                  </div>
                  <table className="mt-4 w-full border-collapse">
                    <thead>
                      <tr
                        style={{ background: s.color }}
                        className="text-white"
                      >
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Details</th>
                        <th className="p-2 text-right">Cash In</th>
                        <th className="p-2 text-right">Cash Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...acc]
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((e, i) => (
                          <tr
                            key={e.id}
                            className={i % 2 ? "bg-slate-50" : ""}
                            style={{ borderBottom: "1px solid #e2e8f0" }}
                          >
                            <td className="p-2">{fmtDate(e.date)}</td>
                            <td className="p-2">{e.note || "-"}</td>
                            <td className="p-2 text-right text-emerald-700">
                              {e.kind === "in" ? money(e.amount) : ""}
                            </td>
                            <td className="p-2 text-right text-red-600">
                              {e.kind === "out" ? money(e.amount) : ""}
                            </td>
                          </tr>
                        ))}
                      <tr className="font-bold">
                        <td className="p-2" colSpan={2}>
                          TOTAL
                        </td>
                        <td className="p-2 text-right">{money(cashIn)}</td>
                        <td className="p-2 text-right">{money(cashOut)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div
                    className="ml-auto mt-4 flex w-full max-w-xs justify-between rounded px-2 py-2 text-lg font-bold text-white"
                    style={{ background: balance >= 0 ? s.color : "#dc2626" }}
                  >
                    <span>BALANCE</span>
                    <span>{money(balance)}</span>
                  </div>
                  <div className="mt-8 text-slate-500">{s.footer}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { background: #fff; }
          .page-break { break-before: page; }
        }
      `}</style>

      {/* ---------- TOP BAR ---------- */}
      <div className="print:hidden sticky top-0 z-20 bg-slate-900 text-white shadow">
        <div className="mx-auto max-w-5xl p-2">
          <div className="flex items-center gap-2">
            <b className="truncate text-sm sm:text-base">{s.company}</b>
            <span className="text-xs text-slate-400">· Demo</span>
            <div className="ml-auto flex gap-2">
              {unlocked && (
                <button
                  onClick={lock}
                  className="rounded bg-slate-700 px-3 py-2 text-xs"
                >
                  🔒 Lock
                </button>
              )}
              <button
                onClick={tryOpenSettings}
                className="rounded bg-amber-400 px-3 py-2 text-xs font-semibold text-slate-900"
              >
                ⚙ Settings
              </button>
            </div>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {enabled.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setView("doc");
                }}
                className={
                  "shrink-0 rounded-full px-4 py-2 text-xs font-medium " +
                  (view === "doc" && cur === t
                    ? "bg-white text-slate-900"
                    : "bg-slate-700")
                }
              >
                {s.types[t].title}
              </button>
            ))}
            <button
              onClick={() => setView("acc")}
              className={
                "shrink-0 rounded-full px-4 py-2 text-xs font-medium " +
                (view === "acc" ? "bg-white text-slate-900" : "bg-slate-700")
              }
            >
              💰 Accounts
            </button>
          </div>
        </div>
      </div>

      {/* ---------- PASSWORD POPUP ---------- */}
      {askPass && (
        <div className="print:hidden fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs space-y-3 rounded-xl bg-white p-5">
            <h2 className="font-bold">Owner Login</h2>
            <p className="text-xs text-slate-500">
              Settings are only for the owner. Enter password.
            </p>
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

      {/* ---------- SETTINGS DRAWER (owner only) ---------- */}
      {open && unlocked && (
        <div className="print:hidden fixed inset-0 z-30 flex justify-end bg-black/50">
          <aside className="h-full w-full space-y-3 overflow-y-auto bg-white p-4 sm:w-96">
            <div className="sticky top-0 -mx-4 -mt-4 flex items-center justify-between bg-white p-4 shadow-sm">
              <h2 className="font-bold">Settings (Owner)</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Done ✓
              </button>
            </div>

            <H>Business details</H>
            <Field label="Company name">
              <input
                className={inp}
                value={s.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </Field>
            <Field label="Tagline">
              <input
                className={inp}
                value={s.tagline}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </Field>
            <Field label="Address">
              <textarea
                className={inp}
                rows={2}
                value={s.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Phone">
                <input
                  className={inp}
                  value={s.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
              <Field label="GSTIN">
                <input
                  className={inp}
                  value={s.gstin}
                  onChange={(e) => set("gstin", e.target.value)}
                />
              </Field>
            </div>

            <H>Logo</H>
            <Field label="Upload logo">
              <input
                type="file"
                accept="image/*"
                onChange={onLogo}
                className="text-xs"
              />
            </Field>
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
            <Field label={`Logo size: ${s.logoSize}px`}>
              <input
                type="range"
                min="40"
                max="140"
                className="w-full"
                value={s.logoSize}
                onChange={(e) => set("logoSize", +e.target.value)}
              />
            </Field>

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
                    <option value="img">Image (upload)</option>
                  </select>
                </Field>
                {s.wmMode === "text" ? (
                  <Field label="Watermark text">
                    <input
                      className={inp}
                      value={s.wmText}
                      onChange={(e) => set("wmText", e.target.value)}
                    />
                  </Field>
                ) : (
                  <>
                    <Field label="Upload watermark image">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onWm}
                        className="text-xs"
                      />
                    </Field>
                    {s.wmImg && (
                      <button
                        className="text-xs text-red-600"
                        onClick={() => set("wmImg", "")}
                      >
                        Remove watermark image
                      </button>
                    )}
                  </>
                )}
                <Field label={`Strength: ${s.wmOpacity}%`}>
                  <input
                    type="range"
                    min="3"
                    max="40"
                    className="w-full"
                    value={s.wmOpacity}
                    onChange={(e) => set("wmOpacity", +e.target.value)}
                  />
                </Field>
              </>
            )}

            <H>Look & feel</H>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Main colour">
                <input
                  type="color"
                  className="h-10 w-full"
                  value={s.color}
                  onChange={(e) => set("color", e.target.value)}
                />
              </Field>
              <Field label="Currency">
                <input
                  className={inp}
                  value={s.currency}
                  onChange={(e) => set("currency", e.target.value)}
                />
              </Field>
            </div>
            <Field label={`Heading size: ${s.titleSize}px`}>
              <input
                type="range"
                min="18"
                max="44"
                className="w-full"
                value={s.titleSize}
                onChange={(e) => set("titleSize", +e.target.value)}
              />
            </Field>
            <Field label={`Text size: ${s.textSize}px`}>
              <input
                type="range"
                min="11"
                max="20"
                className="w-full"
                value={s.textSize}
                onChange={(e) => set("textSize", +e.target.value)}
              />
            </Field>

            <H>Tax, terms & footer</H>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.showGst}
                onChange={(e) => set("showGst", e.target.checked)}
              />{" "}
              Add GST / tax
            </label>
            {s.showGst && (
              <Field label="GST %">
                <input
                  type="number"
                  className={inp}
                  value={s.gst}
                  onChange={(e) => set("gst", +e.target.value)}
                />
              </Field>
            )}
            <Field label="Terms">
              <textarea
                className={inp}
                rows={2}
                value={s.terms}
                onChange={(e) => set("terms", e.target.value)}
              />
            </Field>
            <Field label="Footer message">
              <input
                className={inp}
                value={s.footer}
                onChange={(e) => set("footer", e.target.value)}
              />
            </Field>

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

            <H>Drawing / Plan (for this document)</H>
            <Field label="Upload plan / drawing photos">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPlan}
                className="text-xs"
              />
            </Field>
            <p className="text-xs text-slate-500">Or draw with your finger:</p>
            <Sketch onSave={(d) => setPlans((p) => [...p, d])} />
            {plans.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {plans.map((p, i) => (
                  <div key={i} className="relative">
                    <img
                      src={p}
                      alt="plan"
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
            <button
              onClick={copyLink}
              className="w-full rounded bg-slate-900 py-2 text-sm text-white"
            >
              Copy demo link for customer
            </button>
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

      <div className="mx-auto max-w-5xl p-2 sm:p-3">
        {/* ================= DOCUMENT VIEW ================= */}
        {view === "doc" && (
          <main>
            <div
              className="relative overflow-hidden bg-white p-4 shadow sm:p-6 print:p-0 print:shadow-none"
              style={{ fontSize: s.textSize }}
            >
              {/* watermark */}
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
                      className="-rotate-30 whitespace-nowrap font-black"
                      style={{
                        fontSize: "clamp(40px, 14vw, 110px)",
                        transform: "rotate(-30deg)",
                        color: s.color,
                      }}
                    >
                      {s.wmText}
                    </div>
                  )}
                </div>
              )}

              <div className="relative z-10">
                {/* header */}
                <div
                  className="flex items-center gap-3 border-b-4 pb-4"
                  style={{ borderColor: s.color }}
                >
                  {s.logo ? (
                    <img
                      src={s.logo}
                      alt="logo"
                      className="shrink-0 border border-slate-200 bg-white object-contain p-1"
                      style={{
                        width: s.logoSize,
                        height: s.logoSize,
                        borderRadius: radius,
                      }}
                    />
                  ) : (
                    <div
                      className="flex shrink-0 items-center justify-center font-bold text-white"
                      style={{
                        width: s.logoSize,
                        height: s.logoSize,
                        borderRadius: radius,
                        background: s.color,
                        fontSize: s.logoSize / 2.5,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-bold leading-tight"
                      style={{ color: s.color, fontSize: s.titleSize }}
                    >
                      {s.company}
                    </div>
                    <div className="font-medium text-slate-700">
                      {s.tagline}
                    </div>
                    <div className="whitespace-pre-line text-slate-600">
                      {s.address}
                    </div>
                    <div className="text-slate-600">
                      Ph: {s.phone}
                      {s.gstin && ` · GSTIN: ${s.gstin}`}
                    </div>
                  </div>
                </div>

                {/* title + no/date */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div
                    className="rounded px-3 py-1 font-bold text-white"
                    style={{
                      background: s.color,
                      fontSize: s.titleSize * 0.65,
                    }}
                  >
                    {T.title}
                  </div>
                  <div className="text-right">
                    <div>
                      No: {T.prefix}-
                      <input
                        type="number"
                        className="w-14 border-b border-dashed print:border-0"
                        value={no}
                        onChange={(e) => setNo(e.target.value)}
                      />
                    </div>
                    <div>
                      Date:{" "}
                      <input
                        type="date"
                        className="border-b border-dashed bg-transparent print:border-0"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* customer */}
                <div className="mt-3 rounded border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">To</div>
                  <input
                    placeholder="Customer name"
                    className="w-full bg-transparent font-semibold outline-none"
                    value={cust.name}
                    onChange={(e) => setCust({ ...cust, name: e.target.value })}
                  />
                  <input
                    placeholder="Address"
                    className="w-full bg-transparent outline-none"
                    value={cust.address}
                    onChange={(e) =>
                      setCust({ ...cust, address: e.target.value })
                    }
                  />
                  <input
                    placeholder="Phone"
                    className="w-full bg-transparent outline-none"
                    value={cust.phone}
                    onChange={(e) =>
                      setCust({ ...cust, phone: e.target.value })
                    }
                  />
                </div>

                {/* items (mobile friendly cards) */}
                <div className="mt-4">
                  <div
                    className="rounded-t px-3 py-2 text-sm font-semibold text-white"
                    style={{ background: s.color }}
                  >
                    Items
                  </div>
                  {items.map((it, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 border-b border-slate-200 py-2"
                    >
                      <span className="w-5 text-center text-slate-500">
                        {i + 1}
                      </span>
                      <input
                        placeholder="Description"
                        className="min-w-0 flex-1 basis-40 rounded border border-slate-200 bg-transparent p-1.5 print:border-0"
                        value={it.d}
                        onChange={(e) => upItem(i, "d", e.target.value)}
                      />
                      <label className="text-xs text-slate-500">
                        Qty
                        <input
                          type="number"
                          inputMode="decimal"
                          className="ml-1 w-14 rounded border border-slate-200 bg-transparent p-1.5 text-sm print:border-0"
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
                              className="ml-1 w-24 rounded border border-slate-200 bg-transparent p-1.5 text-right text-sm print:border-0"
                              value={it.r}
                              onChange={(e) => upItem(i, "r", e.target.value)}
                            />
                          </label>
                          <span className="ml-auto min-w-[90px] text-right font-medium">
                            {money((+it.q || 0) * (+it.r || 0))}
                          </span>
                        </>
                      )}
                      {unlocked && (
                        <button
                          className="print:hidden px-2 text-red-600"
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
                    className="print:hidden mt-2 rounded border px-4 py-2 text-sm"
                  >
                    + Add item
                  </button>
                </div>

                {showRates && (
                  <div className="ml-auto mt-4 w-full max-w-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{money(sub)}</span>
                    </div>
                    {s.showGst && (
                      <div className="flex justify-between">
                        <span>GST ({s.gst}%)</span>
                        <span>{money(gstAmt)}</span>
                      </div>
                    )}
                    <div
                      className="flex justify-between border-t-2 pt-1 text-lg font-bold"
                      style={{ borderColor: s.color, color: s.color }}
                    >
                      <span>Total</span>
                      <span>{money(total)}</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 text-slate-600">
                  <b>Terms:</b> {s.terms}
                </div>
                <div className="mt-8 flex items-end justify-between gap-4">
                  <div className="text-slate-500">{s.footer}</div>
                  <div className="shrink-0 border-t border-slate-400 pt-1 text-sm">
                    Authorised signature
                  </div>
                </div>

                {/* drawings / plans */}
                {plans.length > 0 && (
                  <div className="page-break mt-8">
                    <div className="mb-2 font-bold" style={{ color: s.color }}>
                      Drawing / Plan
                    </div>
                    <div className="space-y-3">
                      {plans.map((p, i) => (
                        <img
                          key={i}
                          src={p}
                          alt={"plan " + (i + 1)}
                          className="w-full rounded border border-slate-300"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* download buttons */}
            {/* preview + download buttons */}
            <div className="print:hidden mt-3 space-y-2">
              <button
                onClick={() => setPreview(true)}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white"
              >
                👁 Preview PDF
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPreview(true)}
                  className="rounded-lg bg-emerald-600 py-3 font-semibold text-white"
                >
                  ⬇ Download PDF
                </button>
                <button
                  onClick={downloadExcel}
                  className="rounded-lg bg-green-800 py-3 font-semibold text-white"
                >
                  ⬇ Download Excel
                </button>
              </div>
            </div>
            <p className="print:hidden mt-1 text-center text-xs text-slate-500">
              In Preview, tap ⬇ PDF and choose “Save as PDF”.
            </p>
          </main>
        )}

        {/* ================= ACCOUNTS VIEW ================= */}
        {view === "acc" && (
          <main className="space-y-3">
            <div className="hidden print:block">
              <div className="text-xl font-bold" style={{ color: s.color }}>
                {s.company} — Accounts
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white p-3 shadow">
                <div className="text-xs text-slate-500">Cash In</div>
                <div className="font-bold text-emerald-600">
                  {money(cashIn)}
                </div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow">
                <div className="text-xs text-slate-500">Cash Out</div>
                <div className="font-bold text-red-600">{money(cashOut)}</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow">
                <div className="text-xs text-slate-500">Balance</div>
                <div
                  className="font-bold"
                  style={{ color: balance >= 0 ? s.color : "#dc2626" }}
                >
                  {money(balance)}
                </div>
              </div>
            </div>

            <div className="print:hidden space-y-2 rounded-lg bg-white p-3 shadow">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAf({ ...af, kind: "in" })}
                  className={
                    "rounded py-2 text-sm font-semibold " +
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
                    "rounded py-2 text-sm font-semibold " +
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
                className="w-full rounded bg-slate-900 py-2.5 text-sm font-semibold text-white"
              >
                Add Entry
              </button>
            </div>

            <div className="print:hidden flex gap-2">
              {[
                ["all", "All"],
                ["in", "Cash In"],
                ["out", "Cash Out"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={
                    "rounded-full px-4 py-1.5 text-xs " +
                    (filter === k
                      ? "bg-slate-900 text-white"
                      : "bg-white shadow")
                  }
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
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
                    <div className="text-xs text-slate-500">{e.date}</div>
                  </div>
                  <div
                    className={
                      "font-semibold " +
                      (e.kind === "in" ? "text-emerald-600" : "text-red-600")
                    }
                  >
                    {e.kind === "in" ? "+" : "-"}
                    {money(e.amount)}
                  </div>
                  {unlocked && (
                    <button
                      className="print:hidden px-2 text-red-600"
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

            <div className="print:hidden space-y-2">
              <button
                onClick={() => setPreview(true)}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white"
              >
                👁 Preview PDF
              </button>
              <button
                onClick={downloadExcel}
                className="w-full rounded-lg bg-green-800 py-3 font-semibold text-white"
              >
                ⬇ Download Excel
              </button>
            </div>
          </main>
        )}

        {/* ---------- PITCH BOX ---------- */}
        <div className="print:hidden mt-4 rounded-lg bg-slate-900 p-4 text-white">
          <div className="font-semibold">
            This is a demo. Use it, try it, change the settings.
          </div>
          <p className="mt-1 text-sm text-slate-300">
            {OWNER.offer} No more calculating by hand.
          </p>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded bg-emerald-500 px-4 py-2 font-semibold"
          >
            Chat on WhatsApp: {OWNER.whatsapp.slice(-10)}
          </a>
        </div>
      </div>

      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        className="print:hidden fixed bottom-4 right-4 z-10 rounded-full bg-emerald-500 px-5 py-3 font-bold text-white shadow-lg"
      >
        WhatsApp me
      </a>
    </div>
  );
}
