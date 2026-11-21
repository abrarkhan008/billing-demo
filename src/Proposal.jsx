import { useState, useMemo, useRef, useEffect } from "react";
import { OWNER } from "./config";
import { createShare, LinkManager, ImageInput, readImage } from "./extras";

/* =====================================================================
   THEMES  (first 3 = SIGNATURE premium themes, last 5 = classic)
   ===================================================================== */
const THEMES = {
  noir: {
    id: "noir",
    name: "Diamond Noir",
    tag: "Signature",
    emoji: "💎",
    bg: "radial-gradient(ellipse at 50% 0%,#2a2113 0%,#0b0907 55%,#050403 100%)",
    text: "#f6ecd6",
    sub: "rgba(246,236,214,.68)",
    accent: "#d9b45f",
    grad: "linear-gradient(100deg,#f7e7b4 0%,#d9b45f 45%,#a8802f 100%)",
    btnText: "#1a1407",
    card: "rgba(255,255,255,.045)",
    border: "rgba(217,180,95,.4)",
    font: "'Cormorant Garamond',Georgia,serif",
    head: "'Cinzel',Georgia,serif",
    script: "'Parisienne',cursive",
    particles: ["✦", "◆", "✧"],
    mode: "rise",
  },
  champagne: {
    id: "champagne",
    name: "Champagne Rose Gold",
    tag: "Signature",
    emoji: "🥂",
    bg: "linear-gradient(180deg,#fffaf3 0%,#f6e6d6 55%,#ecd0c0 100%)",
    text: "#3d2a2a",
    sub: "rgba(61,42,42,.68)",
    accent: "#b76e79",
    grad: "linear-gradient(100deg,#d99a8f 0%,#b76e79 50%,#8c4a5a 100%)",
    btnText: "#fff8f2",
    card: "rgba(255,255,255,.72)",
    border: "rgba(183,110,121,.35)",
    font: "'Cormorant Garamond',Georgia,serif",
    head: "'Playfair Display',Georgia,serif",
    script: "'Parisienne',cursive",
    particles: ["🤍", "✨", "🥂"],
    mode: "fall",
  },
  aurora: {
    id: "aurora",
    name: "Midnight Aurora",
    tag: "Signature",
    emoji: "🌌",
    bg: "radial-gradient(ellipse at 20% 0%,#1d4e6b 0%,transparent 55%),radial-gradient(ellipse at 90% 30%,#4a2a8a 0%,transparent 55%),linear-gradient(180deg,#040816 0%,#0a1030 100%)",
    text: "#eafcff",
    sub: "rgba(234,252,255,.7)",
    accent: "#7ef0d4",
    grad: "linear-gradient(100deg,#b5fff0 0%,#7ef0d4 40%,#a78bfa 100%)",
    btnText: "#04121a",
    card: "rgba(255,255,255,.07)",
    border: "rgba(126,240,212,.35)",
    font: "'Cormorant Garamond',Georgia,serif",
    head: "'Cinzel',Georgia,serif",
    script: "'Great Vibes',cursive",
    particles: ["✨", "💫", "🤍"],
    mode: "twinkle",
  },
  royal: {
    id: "royal",
    name: "Royal Rose",
    emoji: "🌹",
    bg: "radial-gradient(ellipse at top,#4a0d26 0%,#14050b 70%)",
    text: "#fdf2e9",
    sub: "rgba(253,242,233,.7)",
    accent: "#e5b869",
    btnText: "#1a0a10",
    card: "rgba(255,255,255,.06)",
    border: "rgba(229,184,105,.35)",
    font: "'Playfair Display',Georgia,serif",
    head: "'Playfair Display',Georgia,serif",
    script: "'Great Vibes',cursive",
    particles: ["🌹", "✨", "❤️"],
    mode: "rise",
  },
  starry: {
    id: "starry",
    name: "Starry Night",
    emoji: "🌙",
    bg: "linear-gradient(180deg,#040613 0%,#0b1240 60%,#201566 100%)",
    text: "#eef2ff",
    sub: "rgba(238,242,255,.7)",
    accent: "#a5b4fc",
    btnText: "#0b1240",
    card: "rgba(255,255,255,.07)",
    border: "rgba(165,180,252,.35)",
    font: "'Cormorant Garamond',Georgia,serif",
    head: "'Cormorant Garamond',Georgia,serif",
    script: "'Great Vibes',cursive",
    particles: ["✨", "⭐", "💫"],
    mode: "twinkle",
  },
  sakura: {
    id: "sakura",
    name: "Sakura Garden",
    emoji: "🌸",
    bg: "linear-gradient(180deg,#fff1f5 0%,#ffd3e2 100%)",
    text: "#5b1030",
    sub: "rgba(91,16,48,.7)",
    accent: "#db2777",
    btnText: "#ffffff",
    card: "rgba(255,255,255,.75)",
    border: "rgba(219,39,119,.25)",
    font: "'Playfair Display',Georgia,serif",
    head: "'Playfair Display',Georgia,serif",
    script: "'Dancing Script',cursive",
    particles: ["🌸", "🌺", "💮"],
    mode: "fall",
  },
  sunset: {
    id: "sunset",
    name: "Golden Sunset",
    emoji: "🌅",
    bg: "linear-gradient(160deg,#ff9a76 0%,#e8567a 45%,#5b2a86 100%)",
    text: "#ffffff",
    sub: "rgba(255,255,255,.82)",
    accent: "#ffe29a",
    btnText: "#4a1d5e",
    card: "rgba(255,255,255,.14)",
    border: "rgba(255,255,255,.35)",
    font: "'Cormorant Garamond',Georgia,serif",
    head: "'Cormorant Garamond',Georgia,serif",
    script: "'Dancing Script',cursive",
    particles: ["💖", "✨", "🕊️"],
    mode: "rise",
  },
  letter: {
    id: "letter",
    name: "Love Letter",
    emoji: "💌",
    bg: "linear-gradient(180deg,#efe3cc 0%,#e4d3b4 100%)",
    text: "#3b2a1a",
    sub: "rgba(59,42,26,.7)",
    accent: "#9b2c2c",
    btnText: "#fff7ec",
    card: "#fbf4e4",
    border: "rgba(155,44,44,.3)",
    font: "'Cormorant Garamond',Georgia,serif",
    head: "'Cormorant Garamond',Georgia,serif",
    script: "'Dancing Script',cursive",
    particles: ["💌", "❤️", "🌿"],
    mode: "rise",
  },
};

const DEFAULT = {
  theme: "noir",
  her: "Priya",
  him: "Rahul",
  question: "Will you marry me?",
  message:
    "From the first day we met, my world became brighter.\nYou are my best friend, my peace and my home.\nI want to spend every sunrise and sunset with you.",
  date: "",
  memories: [
    { t: "The Day We Met", d: "A simple hello that changed my whole life." },
    { t: "Our First Trip", d: "Endless laughter, chai and a million photos." },
    { t: "Every Moment Since", d: "Each day with you is my favourite day." },
  ],
  yesText: "Yes, forever 💍",
  final: "You just made me the happiest person alive. I love you!",
  phone: "",
  snap: "",
  insta: "",
  telegram: "",
  photo: "",
  gallery: [],
  music: "",
  gate: true,
  sign: "Forever yours",
};

const FULL = { minHeight: "100dvh" };

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Parisienne&family=Cinzel:wght@500;600;700&family=Dancing+Script:wght@600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
@keyframes pp-rise{from{transform:translateY(105vh) rotate(0deg)}to{transform:translateY(-12vh) rotate(25deg)}}
@keyframes pp-fall{from{transform:translateY(-12vh) rotate(0deg) translateX(0)}50%{transform:translateY(50vh) rotate(180deg) translateX(30px)}to{transform:translateY(105vh) rotate(360deg) translateX(-20px)}}
@keyframes pp-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.2)}}
@keyframes pp-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes pp-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@keyframes pp-pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes pp-shine{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pp-ring{0%{transform:scale(.85);opacity:.7}100%{transform:scale(1.9);opacity:0}}
@keyframes pp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.pp-up{animation:pp-up .9s ease both}
.pp-beat{animation:pp-beat 1.4s ease-in-out infinite}
.pp-pop{animation:pp-pop .8s ease both}
.pp-float{animation:pp-float 3.2s ease-in-out infinite}
.pp-shine{background-size:200% 100%;animation:pp-shine 4s linear infinite}
.pp-scroll{-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
@media (prefers-reduced-motion:reduce){.pp-up,.pp-beat,.pp-pop,.pp-float,.pp-shine{animation:none!important}}
`;

/* ================= SCROLL REVEAL ================= */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setOn(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(26px)",
        transition: `opacity .9s ease ${delay}ms, transform .9s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ================= FLOATING PARTICLES ================= */
function Particles({ t, count = 14, confetti = false }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const dur = confetti ? 3 + Math.random() * 3 : 11 + Math.random() * 10;
        return {
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: -Math.random() * dur,
          dur,
          size: 13 + Math.random() * 16,
          ch: confetti
            ? ["❤️", "💖", "✨", "🌹", "🎉", "💎"][i % 6]
            : t.particles[i % t.particles.length],
        };
      }),
    [t.id, count, confetti],
  );
  const mode = confetti ? "fall" : t.mode;
  const dots = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        l: Math.random() * 100,
        tp: Math.random() * 100,
        s: 1 + Math.random() * 2.5,
        d: Math.random() * 4,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {!confetti &&
        t.mode === "twinkle" &&
        dots.map((p, i) => (
          <span
            key={"d" + i}
            style={{
              position: "absolute",
              left: p.l + "%",
              top: p.tp + "%",
              width: p.s,
              height: p.s,
              borderRadius: "50%",
              background: "#fff",
              animation: `pp-twinkle ${2 + p.d}s ease-in-out ${p.d}s infinite`,
            }}
          />
        ))}
      {items.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: p.left + "%",
            top: mode === "twinkle" ? p.top + "%" : 0,
            fontSize: p.size,
            opacity: 0.8,
            color: t.accent,
            animation: `pp-${mode} ${p.dur}s linear ${p.delay}s infinite`,
          }}
        >
          {p.ch}
        </span>
      ))}
    </div>
  );
}

/* ================= THE PROPOSAL EXPERIENCE ================= */
function Story({ d, onClose }) {
  const t = THEMES[d.theme] || THEMES.noir;
  const [open, setOpen] = useState(!d.gate);
  const [yes, setYes] = useState(false);
  const [muted, setMuted] = useState(false);
  const [no, setNo] = useState({ n: 0, x: 0, y: 0 });
  const audio = useRef(null);

  const NO_TEXT = [
    "No",
    "Are you sure? 🥺",
    "Think again 💭",
    "Please? 💕",
    "Last chance! 😢",
    "Pretty please 🌹",
  ];
  const days = d.date
    ? Math.max(0, Math.floor((Date.now() - new Date(d.date)) / 864e5))
    : 0;
  const mems = (d.memories || []).filter((m) => m.t || m.d);
  const gallery = (d.gallery || []).filter(Boolean);
  const lines = (d.message || "").split("\n").filter((l) => l.trim());

  // gradient text helper (signature themes) or flat colour
  const gt = t.grad
    ? {
        backgroundImage: t.grad,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }
    : { color: t.accent };
  const btnBg = t.grad || t.accent;

  const card = {
    background: t.card,
    border: `1px solid ${t.border}`,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: t.grad ? `0 20px 60px -25px ${t.accent}55` : "none",
  };

  useEffect(
    () => () => {
      if (audio.current) audio.current.pause();
    },
    [],
  );

  const openGate = () => {
    setOpen(true);
    if (d.music) {
      try {
        const a = new Audio(d.music);
        a.loop = true;
        a.volume = 0.7;
        a.play().catch(() => {});
        audio.current = a;
      } catch {}
    }
  };
  const toggleMute = () => {
    if (!audio.current) return;
    audio.current.muted = !muted;
    setMuted(!muted);
  };

  const dodge = () => {
    const w = Math.min(window.innerWidth, 520);
    const mx = Math.max(40, w / 2 - 120);
    setNo((p) => ({
      n: p.n + 1,
      x: (Math.random() * 2 - 1) * mx,
      y: (Math.random() * 2 - 1) * 90,
    }));
  };

  const num = String(d.phone || "").replace(/\D/g, "");
  const msg = `${d.her} said YES! ❤️💍`;
  const clean = (s) =>
    String(s || "")
      .trim()
      .replace(/^@/, "");
  const contacts = [
    num && {
      k: "wa",
      label: "WhatsApp",
      icon: "💬",
      href: `https://wa.me/${num}?text=${encodeURIComponent(msg)}`,
      bg: "#25D366",
      fg: "#05260f",
    },
    num && {
      k: "sms",
      label: "Text message",
      icon: "✉️",
      href: `sms:+${num}?&body=${encodeURIComponent(msg)}`,
      bg: "#3b82f6",
      fg: "#ffffff",
    },
    num && {
      k: "call",
      label: "Call " + (d.him || "him"),
      icon: "📞",
      href: `tel:+${num}`,
      bg: "#f59e0b",
      fg: "#1a1203",
    },
    d.snap && {
      k: "snap",
      label: "Snapchat",
      icon: "👻",
      href: `https://www.snapchat.com/add/${clean(d.snap)}`,
      bg: "#FFFC00",
      fg: "#000000",
    },
    d.insta && {
      k: "ig",
      label: "Instagram",
      icon: "📸",
      href: `https://ig.me/m/${clean(d.insta)}`,
      bg: "linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)",
      fg: "#ffffff",
    },
    d.telegram && {
      k: "tg",
      label: "Telegram",
      icon: "✈️",
      href: `https://t.me/${clean(d.telegram)}?text=${encodeURIComponent(msg)}`,
      bg: "#229ED9",
      fg: "#ffffff",
    },
  ].filter(Boolean);

  return (
    <div
      className="pp-scroll fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      style={{ background: t.bg, color: t.text, fontFamily: t.font }}
    >
      <style>{STYLE}</style>
      <Particles t={t} />

      {onClose && (
        <button
          onClick={onClose}
          className="fixed right-3 z-[90] rounded-full bg-black/70 px-4 py-2 text-xs font-bold text-white"
          style={{ top: "max(12px, env(safe-area-inset-top))" }}
        >
          ✕ Close preview
        </button>
      )}
      {open && d.music && (
        <button
          onClick={toggleMute}
          aria-label="Toggle music"
          className="fixed left-3 z-[90] flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-base text-white backdrop-blur"
          style={{ top: "max(12px, env(safe-area-inset-top))" }}
        >
          {muted ? "🔇" : "🎵"}
        </button>
      )}

      {/* ---------- CINEMATIC GATE ---------- */}
      {!open && (
        <div
          className="absolute inset-0 z-[80] flex flex-col items-center justify-center px-6 text-center"
          style={{ ...FULL, background: t.bg }}
        >
          <Particles t={t} />
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="pp-up text-[11px] tracking-[0.45em]"
              style={{ color: t.sub, fontFamily: t.head }}
            >
              A PRIVATE MESSAGE FOR
            </div>
            <h1
              className="pp-up mt-4 text-6xl leading-tight sm:text-8xl"
              style={{ fontFamily: t.script, animationDelay: ".25s", ...gt }}
            >
              {d.her || "You"}
            </h1>
            <button
              onClick={openGate}
              aria-label="Open"
              className="pp-up pp-float relative mt-12 flex h-28 w-28 items-center justify-center rounded-full text-4xl shadow-2xl active:scale-95"
              style={{
                animationDelay: ".6s",
                background: btnBg,
                color: t.btnText,
                boxShadow: `0 14px 50px ${t.accent}77`,
              }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${t.accent}`,
                  animation: "pp-ring 2.2s ease-out infinite",
                }}
              />
              💌
            </button>
            <div
              className="pp-up mt-6 text-sm tracking-[0.3em]"
              style={{ color: t.sub, animationDelay: ".9s" }}
            >
              TAP TO OPEN
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="relative z-10">
          {/* ---------- HERO ---------- */}
          <section
            className="flex flex-col items-center justify-center px-6 py-16 text-center"
            style={FULL}
          >
            <div
              className="pp-up text-[11px] tracking-[0.45em]"
              style={{ color: t.accent, fontFamily: t.head }}
            >
              ✦ A SPECIAL QUESTION ✦
            </div>

            {d.photo && (
              <div className="pp-pop relative mt-8">
                <div
                  className="absolute -inset-2 rounded-full"
                  style={{
                    background: btnBg,
                    opacity: 0.9,
                  }}
                />
                <img
                  src={d.photo}
                  alt=""
                  className="relative h-44 w-44 rounded-full object-cover sm:h-56 sm:w-56"
                  style={{
                    border: `5px solid ${t.id === "champagne" || t.id === "sakura" || t.id === "letter" ? "#fff" : "#0b0b0b"}`,
                    boxShadow: `0 0 60px ${t.accent}55`,
                  }}
                />
              </div>
            )}

            <h1
              className="pp-up mt-8 text-6xl leading-[1.1] sm:text-8xl"
              style={{ fontFamily: t.script, animationDelay: ".2s", ...gt }}
            >
              For {d.her || "You"}
            </h1>
            <p
              className="pp-up mt-4 text-xl sm:text-2xl"
              style={{
                color: t.sub,
                animationDelay: ".4s",
                fontStyle: "italic",
              }}
            >
              With all my love, {d.him || "Me"}
            </p>
            <div className="pp-beat mt-10 text-4xl">💖</div>
            <div
              className="mt-5 text-[11px] tracking-[0.35em]"
              style={{ color: t.sub }}
            >
              SCROLL ↓
            </div>
          </section>

          {/* ---------- MESSAGE ---------- */}
          <section className="mx-auto max-w-2xl px-5 py-14">
            <Reveal>
              <div
                className="rounded-[28px] px-6 py-10 text-center sm:px-12 sm:py-14"
                style={card}
              >
                <div className="text-3xl">💌</div>
                <div className="mt-6 space-y-4">
                  {lines.map((l, i) => (
                    <Reveal key={i} delay={i * 220}>
                      <p className="text-[22px] leading-relaxed sm:text-[28px]">
                        {l}
                      </p>
                    </Reveal>
                  ))}
                </div>
                {days > 0 && (
                  <div
                    className="mt-8 inline-block rounded-full px-6 py-2.5 text-sm font-bold"
                    style={{ background: btnBg, color: t.btnText }}
                  >
                    {days.toLocaleString()} days of us ❤️
                  </div>
                )}
              </div>
            </Reveal>
          </section>

          {/* ---------- GALLERY ---------- */}
          {gallery.length > 0 && (
            <section className="mx-auto max-w-4xl px-5 pb-14">
              <Reveal>
                <h2
                  className="text-center text-5xl sm:text-6xl"
                  style={{ fontFamily: t.script, ...gt }}
                >
                  Our Memories
                </h2>
              </Reveal>
              <div
                className={
                  "mt-8 grid gap-4 " +
                  (gallery.length === 1
                    ? "mx-auto max-w-sm grid-cols-1"
                    : gallery.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3")
                }
              >
                {gallery.map((g, i) => (
                  <Reveal key={i} delay={i * 150}>
                    <div
                      className="overflow-hidden rounded-3xl p-2"
                      style={{
                        ...card,
                        transform: `rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`,
                      }}
                    >
                      <img
                        src={g}
                        alt=""
                        className="aspect-[3/4] w-full rounded-2xl object-cover"
                      />
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* ---------- MOMENTS ---------- */}
          {mems.length > 0 && (
            <section className="mx-auto max-w-5xl px-5 pb-14">
              <Reveal>
                <h2
                  className="text-center text-5xl sm:text-6xl"
                  style={{ fontFamily: t.script, ...gt }}
                >
                  Our Beautiful Moments
                </h2>
              </Reveal>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {mems.map((m, i) => (
                  <Reveal key={i} delay={i * 150}>
                    <div
                      className="h-full rounded-3xl px-6 py-8 text-center"
                      style={card}
                    >
                      <div
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-black"
                        style={{
                          background: btnBg,
                          color: t.btnText,
                          fontFamily: t.head,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div
                        className="mt-4 text-2xl font-bold"
                        style={{ fontFamily: t.head }}
                      >
                        {m.t}
                      </div>
                      <p
                        className="mt-2 text-lg leading-snug"
                        style={{ color: t.sub }}
                      >
                        {m.d}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* ---------- THE QUESTION ---------- */}
          <section
            className="flex flex-col items-center justify-center px-6 py-16 text-center"
            style={FULL}
          >
            <Reveal>
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid ${t.accent}`,
                    animation: "pp-ring 2.4s ease-out infinite",
                  }}
                />
                <span className="pp-beat text-6xl">💍</span>
              </div>
              <h2
                className="mt-6 text-6xl leading-[1.1] sm:text-8xl"
                style={{ fontFamily: t.script, ...gt }}
              >
                {d.question}
              </h2>
              <p className="mt-4 text-xl" style={{ color: t.sub }}>
                {d.her}, my heart is waiting for your answer…
              </p>
            </Reveal>

            <div className="relative mt-12 flex min-h-[200px] w-full max-w-md flex-col items-center justify-start gap-6">
              <button
                onClick={() => setYes(true)}
                className="pp-shine rounded-full px-10 py-4 text-lg font-extrabold transition active:scale-95"
                style={{
                  backgroundImage: t.grad
                    ? `${t.grad}`
                    : `linear-gradient(100deg,${t.accent},${t.accent})`,
                  color: t.btnText,
                  transform: `scale(${1 + Math.min(no.n, 6) * 0.07})`,
                  boxShadow: `0 12px 44px ${t.accent}77`,
                }}
              >
                {d.yesText || "Yes 💍"}
              </button>
              <button
                onMouseEnter={dodge}
                onTouchStart={dodge}
                onClick={dodge}
                className="rounded-full px-7 py-3 text-base font-semibold transition-transform duration-200"
                style={{
                  ...card,
                  transform: `translate(${no.x}px,${no.y}px)`,
                }}
              >
                {NO_TEXT[no.n % NO_TEXT.length]}
              </button>
              {no.n > 2 && (
                <div className="text-sm italic" style={{ color: t.sub }}>
                  The “No” button seems shy… 😉
                </div>
              )}
            </div>

            {d.sign && (
              <div
                className="mt-10 text-4xl"
                style={{ fontFamily: t.script, ...gt }}
              >
                {d.sign}, {d.him}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ---------- CELEBRATION ---------- */}
      {yes && (
        <div
          className="pp-scroll fixed inset-0 z-[85] flex items-center justify-center overflow-y-auto p-6 text-center"
          style={{ background: t.bg, color: t.text }}
        >
          <Particles t={t} count={50} confetti />
          <div className="pp-pop relative z-10 max-w-xl">
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${t.accent}`,
                  animation: "pp-ring 1.8s ease-out infinite",
                }}
              />
              <span className="pp-beat text-7xl">💞</span>
            </div>
            <h2
              className="mt-4 text-6xl leading-tight sm:text-8xl"
              style={{ fontFamily: t.script, ...gt }}
            >
              She said YES!
            </h2>
            <p className="mt-6 text-2xl leading-relaxed sm:text-3xl">
              {d.final}
            </p>
            <p className="mt-4 text-xl" style={{ color: t.sub }}>
              — {d.him} ❤️ {d.her}
            </p>
            {contacts.length > 0 && (
              <div
                className="mx-auto mt-9 w-full max-w-sm rounded-3xl p-4"
                style={card}
              >
                <div
                  className="text-xs tracking-[0.3em]"
                  style={{ color: t.sub }}
                >
                  TELL {String(d.him || "HIM").toUpperCase()} YOUR ANSWER
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {contacts.map((c, i) => (
                    <a
                      key={c.k}
                      href={c.href}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        "flex items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-extrabold shadow-lg active:scale-95 " +
                        (contacts.length % 2 === 1 && i === contacts.length - 1
                          ? "col-span-2"
                          : "")
                      }
                      style={{ background: c.bg, color: c.fg }}
                    >
                      <span className="text-lg">{c.icon}</span>
                      {c.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div>
              <button
                onClick={() => setYes(false)}
                className="mt-6 text-sm underline"
                style={{ color: t.sub }}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   STUDIO (your demo + link maker)  — mobile first
   ===================================================================== */
const inp =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-[16px] text-white placeholder-slate-500 outline-none focus:border-amber-400";
const Lbl = ({ children }) => (
  <div className="mb-1.5 mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
    {children}
  </div>
);
const Panel = ({ step, title, sub, children, glow }) => (
  <div
    className={
      "rounded-3xl p-5 sm:p-6 " +
      (glow
        ? "border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-[#0e121d]"
        : "border border-white/10 bg-[#0e121d]")
    }
  >
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-black">
        {step}
      </span>
      <div>
        <div className="text-sm font-extrabold">{title}</div>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
    {children}
  </div>
);

export default function Proposal({ shared }) {
  const [d, setD] = useState({ ...DEFAULT, ...(shared || {}) });
  const [prev, setPrev] = useState(false);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);

  // CLIENT VIEW: only the proposal, no editor
  if (shared) return <Story d={d} />;

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const setMem = (i, k, v) =>
    set(
      "memories",
      d.memories.map((m, j) => (j === i ? { ...m, [k]: v } : m)),
    );
  const gallery = d.gallery || [];

  const makeLink = async () => {
    setBusy(true);
    try {
      const url = await createShare("proposal", `${d.him} → ${d.her}`, d);
      setLink(url);
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
    } catch {
      alert("Could not create link. Check Supabase keys in extras.jsx");
    }
    setBusy(false);
  };

  const wa = `https://wa.me/${OWNER.whatsapp}?text=${encodeURIComponent(
    "Hi, I saw your Proposal website demo. I am interested.",
  )}`;

  const sig = Object.values(THEMES).filter((x) => x.tag);
  const classic = Object.values(THEMES).filter((x) => !x.tag);

  const ThemeCard = ({ t }) => (
    <button
      onClick={() => set("theme", t.id)}
      className={
        "overflow-hidden rounded-2xl text-left transition active:scale-[.98] " +
        (d.theme === t.id ? "ring-2 ring-amber-400" : "ring-1 ring-white/10")
      }
    >
      <div
        className="relative flex h-28 flex-col items-center justify-center sm:h-32"
        style={{ background: t.bg, color: t.text }}
      >
        {t.tag && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider"
            style={{ background: t.grad || t.accent, color: t.btnText }}
          >
            ★ SIGNATURE
          </span>
        )}
        <div className="text-3xl">{t.emoji}</div>
        <div
          className="mt-1 text-2xl"
          style={{ fontFamily: t.script, color: t.accent }}
        >
          {d.her || "Her"}
        </div>
      </div>
      <div className="flex items-center justify-between bg-[#0e121d] px-3 py-2.5">
        <span className="text-xs font-bold">{t.name}</span>
        {d.theme === t.id && <span className="text-amber-400">✓</span>}
      </div>
    </button>
  );

  return (
    <div
      className="min-h-screen bg-[#07090e] pb-32 text-slate-100 sm:pb-16"
      style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}
    >
      <style>{STYLE}</style>
      {prev && <Story d={d} onClose={() => setPrev(false)} />}

      {/* glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-rose-500/5 blur-3xl" />
      </div>

      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07090e]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
          <a
            href="/"
            className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-white/20"
          >
            ← Hub
          </a>
          <div className="min-w-0 flex-1 truncate text-sm font-extrabold">
            💍 Proposal Studio{" "}
            <span className="font-serif italic text-amber-400">Premium</span>
          </div>
          <button
            onClick={() => setPrev(true)}
            className="shrink-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-2 text-xs font-extrabold text-black"
          >
            👁 Preview
          </button>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl px-4 pt-8">
        {/* hero */}
        <div className="text-center">
          <div className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] text-amber-300">
            ✦ 8 CINEMATIC THEMES ✦
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            Make Her Say{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              YES
            </span>{" "}
            💖
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            Pick a theme, add your story, generate a private link and send it.
            She opens the surprise, and the magic begins.
          </p>
        </div>

        {/* THEMES */}
        <div className="mt-10 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-black">
            1
          </span>
          <div className="text-sm font-extrabold">Choose a theme</div>
        </div>

        <div className="mt-4 text-[11px] font-bold uppercase tracking-widest text-amber-300">
          ★ Signature collection (most loved)
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sig.map((t) => (
            <ThemeCard key={t.id} t={t} />
          ))}
        </div>

        <div className="mt-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Classic collection
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {classic.map((t) => (
            <ThemeCard key={t.id} t={t} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <Panel
              step="2"
              title="Couple details"
              sub="Her name, his name and the big question"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Lbl>Her name</Lbl>
                  <input
                    className={inp}
                    value={d.her}
                    onChange={(e) => set("her", e.target.value)}
                  />
                </div>
                <div>
                  <Lbl>His name</Lbl>
                  <input
                    className={inp}
                    value={d.him}
                    onChange={(e) => set("him", e.target.value)}
                  />
                </div>
              </div>
              <Lbl>The big question</Lbl>
              <input
                className={inp}
                value={d.question}
                onChange={(e) => set("question", e.target.value)}
              />
              <Lbl>Love message (one line per row)</Lbl>
              <textarea
                rows={5}
                className={inp}
                value={d.message}
                onChange={(e) => set("message", e.target.value)}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Lbl>Together since (optional)</Lbl>
                  <input
                    type="date"
                    className={inp}
                    value={d.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </div>
                <div>
                  <Lbl>Yes button text</Lbl>
                  <input
                    className={inp}
                    value={d.yesText}
                    onChange={(e) => set("yesText", e.target.value)}
                  />
                </div>
              </div>
              <Lbl>Message after she says YES</Lbl>
              <input
                className={inp}
                value={d.final}
                onChange={(e) => set("final", e.target.value)}
              />
              <Lbl>His mobile number (WhatsApp + SMS + Call)</Lbl>
              <input
                className={inp}
                inputMode="tel"
                placeholder="919876543210 (country code + number)"
                value={d.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
              <div className="mt-1 text-[11px] text-slate-500">
                No + or spaces. India example: 91 then the 10-digit number.
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Lbl>Snapchat ID</Lbl>
                  <input
                    className={inp}
                    placeholder="rahul_123"
                    value={d.snap}
                    onChange={(e) => set("snap", e.target.value)}
                  />
                </div>
                <div>
                  <Lbl>Instagram ID</Lbl>
                  <input
                    className={inp}
                    placeholder="rahul.official"
                    value={d.insta}
                    onChange={(e) => set("insta", e.target.value)}
                  />
                </div>
                <div>
                  <Lbl>Telegram ID</Lbl>
                  <input
                    className={inp}
                    placeholder="rahul_tg"
                    value={d.telegram}
                    onChange={(e) => set("telegram", e.target.value)}
                  />
                </div>
              </div>
              <Lbl>Her photo (optional)</Lbl>
              <div className="text-slate-300">
                <ImageInput
                  onFile={(f) =>
                    readImage(f, 500, "image/jpeg", (x) => set("photo", x))
                  }
                />
              </div>
              {d.photo && (
                <button
                  className="mt-1 text-xs text-red-400"
                  onClick={() => set("photo", "")}
                >
                  Remove photo
                </button>
              )}
            </Panel>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <Panel step="3" title="Beautiful moments" sub="Three story cards">
              {d.memories.map((m, i) => (
                <div
                  key={i}
                  className="mt-3 rounded-2xl border border-white/10 p-3"
                >
                  <input
                    className={inp}
                    placeholder={`Moment ${i + 1} title`}
                    value={m.t}
                    onChange={(e) => setMem(i, "t", e.target.value)}
                  />
                  <input
                    className={inp + " mt-2"}
                    placeholder="Short description"
                    value={m.d}
                    onChange={(e) => setMem(i, "d", e.target.value)}
                  />
                </div>
              ))}
            </Panel>

            <Panel step="★" title="Premium extras" sub="Make it unforgettable">
              <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-3 text-sm">
                <span>
                  <b>Cinematic opening</b>
                  <span className="block text-xs text-slate-400">
                    “Tap to open” screen before the story starts
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-amber-400"
                  checked={!!d.gate}
                  onChange={(e) => set("gate", e.target.checked)}
                />
              </label>

              <Lbl>Photo gallery (up to 3)</Lbl>
              {gallery.length < 3 && (
                <div className="text-slate-300">
                  <ImageInput
                    onFile={(f) =>
                      readImage(f, 700, "image/jpeg", (x) =>
                        set("gallery", [...gallery, x]),
                      )
                    }
                  />
                </div>
              )}
              {gallery.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {gallery.map((g, i) => (
                    <div key={i} className="relative">
                      <img
                        src={g}
                        alt=""
                        className="h-24 w-full rounded-xl border border-white/10 object-cover"
                      />
                      <button
                        onClick={() =>
                          set(
                            "gallery",
                            gallery.filter((_, j) => j !== i),
                          )
                        }
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Lbl>Background music link (optional, direct .mp3)</Lbl>
              <input
                className={inp}
                placeholder="https://yoursite.com/music/love.mp3"
                value={d.music}
                onChange={(e) => set("music", e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Put your song in <code>public/music/</code> and use{" "}
                <code>/music/love.mp3</code>. It starts when she taps “open”.
              </p>

              <Lbl>Sign-off line</Lbl>
              <input
                className={inp}
                value={d.sign}
                onChange={(e) => set("sign", e.target.value)}
              />
            </Panel>

            <Panel
              step="4"
              title="Send to client"
              sub="Private link, delete anytime"
              glow
            >
              <button
                onClick={makeLink}
                disabled={busy}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-3.5 text-sm font-extrabold text-black disabled:opacity-60"
              >
                {busy ? "Creating…" : "🔗 Generate Private Link"}
              </button>
              {link && (
                <div className="mt-3 rounded-xl bg-black/40 p-3 text-xs">
                  <div className="break-all font-mono text-emerald-300">
                    {link}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => navigator.clipboard?.writeText(link)}
                      className="flex-1 rounded-lg bg-white/10 py-2.5 font-semibold"
                    >
                      Copy
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent("Open this surprise 💖 " + link)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-center font-bold text-black"
                    >
                      Send on WhatsApp
                    </a>
                  </div>
                </div>
              )}
              <div className="mt-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Client links (delete anytime)
              </div>
              <div className="mt-2 text-slate-200">
                <LinkManager app="proposal" getData={() => d} />
              </div>
            </Panel>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0d111c] to-black/80 p-8 text-center ring-1 ring-amber-500/30">
          <div className="text-2xl font-black sm:text-3xl">
            Want a proposal website for someone special?
          </div>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Custom story, photos, music and your own private link, ready in
            minutes.
          </p>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block rounded-full bg-amber-400 px-8 py-3.5 text-sm font-extrabold text-black"
          >
            Order on WhatsApp →
          </a>
        </div>
      </div>

      {/* mobile sticky action bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-white/10 bg-[#07090e]/95 p-3 backdrop-blur-xl sm:hidden"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={() => setPrev(true)}
          className="flex-1 rounded-xl border border-white/20 bg-white/5 py-3 text-sm font-bold"
        >
          👁 Preview
        </button>
        <button
          onClick={makeLink}
          disabled={busy}
          className="flex-[1.4] rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-3 text-sm font-extrabold text-black disabled:opacity-60"
        >
          {busy ? "Creating…" : "🔗 Generate Link"}
        </button>
      </div>
    </div>
  );
}
