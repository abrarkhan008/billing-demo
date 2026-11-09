import { useState } from "react";
import { OWNER } from "./config";

/* ---------- products: link path + name in each language ---------- */
const PRODUCTS = {
  site: { path: "site", label: "Business website", en: "website", hi: "वेबसाइट", kn: "ವೆಬ್‌ಸೈಟ್", preset: "sitePresets", key: "name" },
  bill: { path: "bill", label: "Billing app", en: "billing app", hi: "बिलिंग ऐप", kn: "ಬಿಲ್ಲಿಂಗ್ ಆ್ಯಪ್", preset: "billPresets", key: "company" },
  shop: { path: "shop", label: "Online shop", en: "online shop", hi: "ऑनलाइन शॉप", kn: "ಆನ್‌ಲೈನ್ ಶಾಪ್", preset: "", key: "" },
  dine: { path: "dine", label: "Restaurant QR ordering", en: "QR ordering system", hi: "QR ऑर्डरिंग सिस्टम", kn: "QR ಆರ್ಡರಿಂಗ್ ಸಿಸ್ಟಮ್", preset: "", key: "" },
  cars: { path: "cars", label: "Used car showroom", en: "car showroom website", hi: "कार शोरूम वेबसाइट", kn: "ಕಾರ್ ಶೋರೂಮ್ ವೆಬ್‌ಸೈಟ್", preset: "carsPresets", key: "name" },
  estate: { path: "estate", label: "Real estate", en: "property website", hi: "प्रॉपर्टी वेबसाइट", kn: "ಪ್ರಾಪರ್ಟಿ ವೆಬ್‌ಸೈಟ್", preset: "estatePresets", key: "name" },
};

const STATUS = ["New", "Message sent", "Followed up", "Interested", "Paid", "Not interested"];

/* ---------- message templates: v = {o: greeting name, n: business, l: link, me, p: price, mp: monthly, upi, prod} ---------- */
const T = {
  en: {
    first: (v) => `Hi ${v.o}! I'm ${v.me}. I made a free sample ${v.prod} for ${v.n}.\n\nHave a look: ${v.l}\n\nIf you like it, I can set it up with your real photos and prices in 2 days. Tell me what you think 🙏`,
    f1: (v) => `Hi ${v.o}, did you get a chance to see the sample for ${v.n}?\n${v.l}\n\nHappy to change the colours, photos or anything you want.`,
    f2: (v) => `Hi ${v.o}, one last message about the ${v.prod} for ${v.n}. Customers now check online before they visit, so this helps you get more enquiries.\n\nIf you'd like to go ahead, I can start today. If not, no problem at all 🙂`,
    insta: (v) => `Hi! Love the work at ${v.n} 😊 I make websites and apps for local businesses, and I already made a free sample for you:\n${v.l}\n\nCan I set it up with your photos? Looking costs nothing.`,
    walk: (v) => `"Hello, I'm ${v.me}. I make ${v.prod}s for local businesses. I already made a sample for ${v.n}. Can I show you on my phone? It takes one minute."\n\n[Show this link: ${v.l}]\n\n"Your customers can see your work and contact you on WhatsApp. Setup is ${v.p}. Shall I start with your photos?"`,
    price: (v) => `Great, thank you ${v.o}! Here's how it works:\n\n1. Setup price: ${v.p} (one time)\n2. I add your real photos, prices and contact details\n3. Ready in 2 days. You check and approve\n4. Optional: ${v.mp} per month and I handle all your updates\n\nPlease send your logo, photos and price list on this chat 🙏`,
    adv: (v) => `To start the work for ${v.n}, please pay a 50% advance.\nUPI: ${v.upi}\n\nAfter paying, send me a screenshot and I'll begin right away. The balance is due when you approve the final ${v.prod}. Thank you!`,
    done: (v) => `Hi ${v.o}, your ${v.prod} for ${v.n} is ready! 🎉\n\nLink: ${v.l}\n\nTap the yellow Edit button to change photos and prices. I'll send the password separately.\n\nPlease pay the balance amount. Thank you for trusting me!`,
    review: (v) => `Hi ${v.o}, thank you for choosing me! If you're happy with the ${v.prod}, could you send a short review and one line about ${v.n}? I'd like to show it to other businesses 🙏`,
    ref: (v) => `Hi ${v.o}, glad you like it! Do you know another business owner (a friend, relative or nearby shop) who could use this? If they join through you, you get ₹500 off your next month. Just send me their number 🙏`,
  },
  hi: {
    first: (v) => `नमस्ते ${v.o}! मैं ${v.me} हूँ। मैंने आपके ${v.n} के लिए एक फ्री ${v.prod} सैंपल बनाया है।\n\nयहाँ देखिए: ${v.l}\n\nपसंद आए तो आपकी असली फोटो और रेट के साथ 2 दिन में तैयार हो जाएगा। बताइए कैसा लगा 🙏`,
    f1: (v) => `नमस्ते ${v.o}, क्या आपने ${v.n} का सैंपल देखा?\n${v.l}\n\nरंग, फोटो या कुछ भी बदलवाना हो तो बता दीजिए।`,
    f2: (v) => `नमस्ते ${v.o}, ${v.n} के ${v.prod} के बारे में आखिरी मैसेज। आजकल ग्राहक आने से पहले ऑनलाइन देखते हैं, इससे आपको ज़्यादा पूछताछ मिलेगी।\n\nशुरू करना हो तो आज ही शुरू कर देते हैं। नहीं तो कोई बात नहीं 🙂`,
    insta: (v) => `नमस्ते! ${v.n} का काम बहुत पसंद आया 😊 मेरा काम लोकल बिज़नेस के लिए वेबसाइट और ऐप बनाना है। आपके लिए फ्री सैंपल बनाया है:\n${v.l}\n\nआपकी फोटो के साथ तैयार कर दूँ? देखने का कोई पैसा नहीं।`,
    walk: (v) => `"नमस्ते, मैं ${v.me} हूँ। मैं लोकल बिज़नेस के लिए ${v.prod} बनाता हूँ। ${v.n} के लिए मैंने पहले से एक सैंपल बनाया है। फोन पर दिखाऊँ? सिर्फ एक मिनट लगेगा।"\n\n[यह लिंक दिखाइए: ${v.l}]\n\n"आपके ग्राहक आपका काम देख सकते हैं और WhatsApp पर सीधे संपर्क कर सकते हैं। सेटअप ${v.p} में हो जाएगा। आपकी फोटो के साथ शुरू करें?"`,
    price: (v) => `बहुत बढ़िया, धन्यवाद ${v.o}! ऐसे काम होगा:\n\n1. सेटअप कीमत: ${v.p} (एक बार)\n2. आपकी असली फोटो, रेट और संपर्क डाले जाएँगे\n3. 2 दिन में तैयार, आप देखकर मंज़ूर करें\n4. चाहें तो: ${v.mp} प्रति माह में सारे अपडेट हम कर देंगे\n\nकृपया अपना लोगो, फोटो और रेट लिस्ट इसी चैट में भेजिए 🙏`,
    adv: (v) => `${v.n} का काम शुरू करने के लिए कृपया 50% एडवांस दीजिए।\nUPI: ${v.upi}\n\nपेमेंट के बाद स्क्रीनशॉट भेज दीजिए, काम तुरंत शुरू हो जाएगा। बाकी रकम फाइनल ${v.prod} पसंद आने पर देनी है। धन्यवाद!`,
    done: (v) => `नमस्ते ${v.o}, ${v.n} का ${v.prod} तैयार है! 🎉\n\nलिंक: ${v.l}\n\nफोटो और रेट बदलने के लिए पीले Edit बटन पर टैप कीजिए। पासवर्ड अलग से भेजूँगा।\n\nकृपया बाकी रकम का भुगतान कर दीजिए। भरोसा करने के लिए धन्यवाद!`,
    review: (v) => `नमस्ते ${v.o}, मुझे चुनने के लिए धन्यवाद! अगर ${v.prod} पसंद आया हो तो कृपया एक छोटा रिव्यू और ${v.n} के बारे में एक लाइन भेज दीजिए। मैं इसे दूसरे बिज़नेस को दिखाना चाहता हूँ 🙏`,
    ref: (v) => `नमस्ते ${v.o}, खुशी है कि आपको पसंद आया! क्या आप किसी और बिज़नेस वाले (दोस्त, रिश्तेदार या पास की दुकान) को जानते हैं जिन्हें यह चाहिए? अगर वे आपके ज़रिए जुड़ते हैं तो अगले महीने ₹500 की छूट मिलेगी। बस उनका नंबर भेज दीजिए 🙏`,
  },
  kn: {
    first: (v) => `ನಮಸ್ಕಾರ ${v.o}! ನಾನು ${v.me}. ನಿಮ್ಮ ${v.n} ಗಾಗಿ ಉಚಿತ ${v.prod} ಮಾದರಿ ತಯಾರಿಸಿದ್ದೇನೆ.\n\nಇಲ್ಲಿ ನೋಡಿ: ${v.l}\n\nಇಷ್ಟವಾದರೆ ನಿಮ್ಮ ನಿಜವಾದ ಫೋಟೋ ಮತ್ತು ದರಗಳೊಂದಿಗೆ 2 ದಿನಗಳಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಿ ಕೊಡುತ್ತೇನೆ. ಹೇಗನಿಸಿತು ತಿಳಿಸಿ 🙏`,
    f1: (v) => `ನಮಸ್ಕಾರ ${v.o}, ${v.n} ಮಾದರಿ ನೋಡಿದ್ರಾ?\n${v.l}\n\nಬಣ್ಣ, ಫೋಟೋ ಅಥವಾ ಏನಾದರೂ ಬದಲಾಯಿಸಬೇಕಿದ್ದರೆ ಹೇಳಿ.`,
    f2: (v) => `ನಮಸ್ಕಾರ ${v.o}, ${v.n} ${v.prod} ಬಗ್ಗೆ ಕೊನೆಯ ಸಂದೇಶ. ಈಗ ಗ್ರಾಹಕರು ಬರುವ ಮೊದಲು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ನೋಡುತ್ತಾರೆ, ಇದರಿಂದ ನಿಮಗೆ ಹೆಚ್ಚು ವಿಚಾರಣೆಗಳು ಬರುತ್ತವೆ.\n\nಮುಂದುವರಿಯಬೇಕಿದ್ದರೆ ಇಂದೇ ಶುರು ಮಾಡುತ್ತೇನೆ. ಇಲ್ಲದಿದ್ದರೆ ಪರವಾಗಿಲ್ಲ 🙂`,
    insta: (v) => `ನಮಸ್ಕಾರ! ${v.n} ಕೆಲಸ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ 😊 ನನ್ನ ಕೆಲಸ ಸ್ಥಳೀಯ ವ್ಯಾಪಾರಗಳಿಗೆ ವೆಬ್‌ಸೈಟ್ ಮತ್ತು ಆ್ಯಪ್ ಮಾಡಿಕೊಡುವುದು. ನಿಮಗಾಗಿ ಉಚಿತ ಮಾದರಿ ಮಾಡಿದ್ದೇನೆ:\n${v.l}\n\nನಿಮ್ಮ ಫೋಟೋ ಹಾಕಿ ಸಿದ್ಧಪಡಿಸಲೇ? ನೋಡಲು ಯಾವ ಶುಲ್ಕವೂ ಇಲ್ಲ.`,
    walk: (v) => `"ನಮಸ್ಕಾರ, ನಾನು ${v.me}. ಸ್ಥಳೀಯ ವ್ಯಾಪಾರಗಳಿಗೆ ${v.prod} ಮಾಡಿಕೊಡುತ್ತೇನೆ. ${v.n} ಗಾಗಿ ಈಗಾಗಲೇ ಒಂದು ಮಾದರಿ ಮಾಡಿದ್ದೇನೆ. ನನ್ನ ಫೋನ್‌ನಲ್ಲಿ ತೋರಿಸಲೇ? ಒಂದು ನಿಮಿಷ ಸಾಕು."\n\n[ಈ ಲಿಂಕ್ ತೋರಿಸಿ: ${v.l}]\n\n"ನಿಮ್ಮ ಗ್ರಾಹಕರು ನಿಮ್ಮ ಕೆಲಸ ನೋಡಿ WhatsApp ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಬಹುದು. ಸೆಟಪ್ ಬೆಲೆ ${v.p}. ನಿಮ್ಮ ಫೋಟೋಗಳೊಂದಿಗೆ ಶುರು ಮಾಡಲೇ?"`,
    price: (v) => `ತುಂಬಾ ಒಳ್ಳೆಯದು, ಧನ್ಯವಾದ ${v.o}! ಕೆಲಸ ಹೀಗೆ ನಡೆಯುತ್ತದೆ:\n\n1. ಸೆಟಪ್ ಬೆಲೆ: ${v.p} (ಒಂದು ಬಾರಿ)\n2. ನಿಮ್ಮ ನಿಜವಾದ ಫೋಟೋ, ದರ ಮತ್ತು ಸಂಪರ್ಕ ವಿವರ ಹಾಕುತ್ತೇನೆ\n3. 2 ದಿನದಲ್ಲಿ ಸಿದ್ಧ, ನೀವು ನೋಡಿ ಒಪ್ಪಿಗೆ ಕೊಡಿ\n4. ಬೇಕಿದ್ದರೆ: ತಿಂಗಳಿಗೆ ${v.mp} ಕೊಟ್ಟರೆ ಎಲ್ಲಾ ಅಪ್‌ಡೇಟ್ ನಾನೇ ಮಾಡುತ್ತೇನೆ\n\nದಯವಿಟ್ಟು ನಿಮ್ಮ ಲೋಗೋ, ಫೋಟೋ ಮತ್ತು ದರಪಟ್ಟಿಯನ್ನು ಈ ಚಾಟ್‌ನಲ್ಲಿ ಕಳುಹಿಸಿ 🙏`,
    adv: (v) => `${v.n} ಕೆಲಸ ಶುರು ಮಾಡಲು ದಯವಿಟ್ಟು 50% ಮುಂಗಡ ಪಾವತಿಸಿ.\nUPI: ${v.upi}\n\nಪಾವತಿಸಿದ ನಂತರ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಕಳುಹಿಸಿ, ತಕ್ಷಣ ಕೆಲಸ ಶುರು ಮಾಡುತ್ತೇನೆ. ಉಳಿದ ಹಣವನ್ನು ಅಂತಿಮ ${v.prod} ಒಪ್ಪಿದ ಮೇಲೆ ಕೊಡಿ. ಧನ್ಯವಾದ!`,
    done: (v) => `ನಮಸ್ಕಾರ ${v.o}, ${v.n} ${v.prod} ಸಿದ್ಧವಾಗಿದೆ! 🎉\n\nಲಿಂಕ್: ${v.l}\n\nಫೋಟೋ ಮತ್ತು ದರ ಬದಲಾಯಿಸಲು ಹಳದಿ Edit ಬಟನ್ ಒತ್ತಿ. ಪಾಸ್‌ವರ್ಡ್ ಬೇರೆಯಾಗಿ ಕಳುಹಿಸುತ್ತೇನೆ.\n\nದಯವಿಟ್ಟು ಉಳಿದ ಹಣ ಪಾವತಿಸಿ. ನಂಬಿಕೆಗೆ ಧನ್ಯವಾದ!`,
    review: (v) => `ನಮಸ್ಕಾರ ${v.o}, ನನ್ನನ್ನು ಆರಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ! ${v.prod} ಇಷ್ಟವಾಗಿದ್ದರೆ ದಯವಿಟ್ಟು ಒಂದು ಚಿಕ್ಕ ವಿಮರ್ಶೆ ಮತ್ತು ${v.n} ಬಗ್ಗೆ ಒಂದು ಸಾಲು ಕಳುಹಿಸಿ. ಬೇರೆ ವ್ಯಾಪಾರಿಗಳಿಗೆ ತೋರಿಸಲು ಬಯಸುತ್ತೇನೆ 🙏`,
    ref: (v) => `ನಮಸ್ಕಾರ ${v.o}, ನಿಮಗೆ ಇಷ್ಟವಾಗಿದ್ದು ಸಂತೋಷ! ಇದು ಬೇಕಾಗಬಹುದಾದ ಬೇರೆ ವ್ಯಾಪಾರಿಗಳು (ಸ್ನೇಹಿತರು, ಸಂಬಂಧಿಕರು ಅಥವಾ ಹತ್ತಿರದ ಅಂಗಡಿ) ನಿಮಗೆ ಗೊತ್ತೇ? ಅವರು ನಿಮ್ಮ ಮೂಲಕ ಬಂದರೆ ಮುಂದಿನ ತಿಂಗಳಿಗೆ ₹500 ರಿಯಾಯಿತಿ ಸಿಗುತ್ತದೆ. ಅವರ ನಂಬರ್ ಕಳುಹಿಸಿ 🙏`,
  },
};

/* order, title, when to send, where to send */
const STEPS = [
  ["first", "1. First message", "Send this first, together with the link.", "wa"],
  ["insta", "1b. Instagram message", "Use this if you only find them on Instagram. Paste it in their DM.", "ig"],
  ["walk", "1c. Say it in the shop", "Use this when you walk in. Show the link on your phone.", "say"],
  ["f1", "2. Follow-up after 1 day", "Send if they did not reply.", "wa"],
  ["f2", "3. Last follow-up after 3 days", "Send once more. After this, stop.", "wa"],
  ["price", "4. They are interested", "Send when they say they like it or ask the price.", "wa"],
  ["adv", "5. Ask for advance", "Send after they agree. Start work only after payment.", "wa"],
  ["done", "6. Work is ready", "Send when you have added their photos and prices.", "wa"],
  ["review", "7. Ask for a review", "Send 2 days after delivery.", "wa"],
  ["ref", "8. Ask for a referral", "Send together with, or right after, the review message.", "wa"],
];

const inp = "w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900";
const phoneDigits = (p) => { const x = (p || "").replace(/\D/g, ""); return x.length === 10 ? "91" + x : x; };
const slugOf = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);

function useLS(key, init) {
  const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? init; } catch { return init; } });
  return [v, (n) => { setV(n); try { localStorage.setItem(key, JSON.stringify(n)); } catch {} }];
}

export default function Messages() {
  const [ok, setOk] = useState(false);
  const [pass, setPass] = useState("");
  const [me, setMe] = useLS("msg-me", { name: "", price: "₹4,999", monthly: "₹499", upi: "" });
  const [cu, setCu] = useState({ product: "site", biz: "", owner: "", phone: "", slug: "" });
  const [lang, setLang] = useState("en");
  const [list, setList] = useLS("msg-customers", []);
  const [copied, setCopied] = useState("");

  if (!ok)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-xs space-y-3 rounded-xl bg-white p-5">
          <h1 className="font-bold">Message maker (private)</h1>
          <input type="password" autoFocus className={inp} placeholder="Owner password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (pass === OWNER.password ? setOk(true) : alert("Wrong password"))} />
          <button onClick={() => (pass === OWNER.password ? setOk(true) : alert("Wrong password"))} className="w-full rounded bg-slate-900 py-2.5 text-sm font-semibold text-white">Open</button>
        </div>
      </div>
    );

  const P = PRODUCTS[cu.product];
  const slug = cu.slug || slugOf(cu.biz);
  const link = `${location.origin}/${P.path}/${slug || "name"}`;
  const v = {
    o: cu.owner || (lang === "en" ? "there" : lang === "hi" ? "जी" : "ಸರ್/ಮೇಡಂ"),
    n: cu.biz || "[business name]",
    l: link,
    me: me.name || "[your name]",
    p: me.price || "[price]",
    mp: me.monthly || "[monthly price]",
    upi: me.upi || "[your UPI id]",
    prod: P[lang],
  };

  const copy = async (key, text) => {
    try { await navigator.clipboard.writeText(text); } catch { prompt("Copy this message:", text); }
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };
  const waLink = (text) => `https://wa.me/${phoneDigits(cu.phone)}?text=${encodeURIComponent(text)}`;
  const saveCustomer = () => {
    if (!cu.biz) return alert("Enter the business name first");
    const rec = { ...cu, slug, status: "New", id: Date.now(), date: new Date().toISOString().slice(0, 10) };
    setList([rec, ...list.filter((x) => !(x.biz === cu.biz && x.product === cu.product))]);
  };
  const preset =
    P.preset &&
    `// paste inside ${P.preset} in your presets file\n  ${slug || "name"}: {\n    ${P.key}: "${cu.biz || "Business name"}",\n    phone: "9999999999",\n    address: "Area, City",\n    color: "#0e5a47",\n  },`;

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <header className="sticky top-0 z-10 bg-slate-900 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <b>Message maker</b>
          <span className="text-xs text-slate-400">Only you can see this page</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 p-3">
        {/* STEP A */}
        <section className="space-y-2 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">Step 1: Your details (saved on this phone)</h2>
          <div className="grid grid-cols-2 gap-2">
            <input className={inp} placeholder="Your name" value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} />
            <input className={inp} placeholder="Your UPI id" value={me.upi} onChange={(e) => setMe({ ...me, upi: e.target.value })} />
            <input className={inp} placeholder="Setup price (e.g. ₹4,999)" value={me.price} onChange={(e) => setMe({ ...me, price: e.target.value })} />
            <input className={inp} placeholder="Monthly price (e.g. ₹499)" value={me.monthly} onChange={(e) => setMe({ ...me, monthly: e.target.value })} />
          </div>
        </section>

        {/* STEP B */}
        <section className="space-y-2 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">Step 2: Your customer</h2>
          <select className={inp} value={cu.product} onChange={(e) => setCu({ ...cu, product: e.target.value })}>
            {Object.entries(PRODUCTS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
          </select>
          <input className={inp} placeholder="Customer business name (e.g. Priya Mehendi Art)" value={cu.biz} onChange={(e) => setCu({ ...cu, biz: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={inp} placeholder="Owner name (optional)" value={cu.owner} onChange={(e) => setCu({ ...cu, owner: e.target.value })} />
            <input className={inp} inputMode="tel" placeholder="Their phone (optional)" value={cu.phone} onChange={(e) => setCu({ ...cu, phone: e.target.value })} />
          </div>
          <input className={inp} placeholder={`Link name (auto: ${slugOf(cu.biz) || "name"})`} value={cu.slug} onChange={(e) => setCu({ ...cu, slug: slugOf(e.target.value) })} />
          <div className="rounded bg-slate-100 p-2 text-sm">
            <div className="text-xs text-slate-500">Their demo link</div>
            <div className="break-all font-semibold">{link}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => copy("link", link)} className="flex-1 rounded border py-2 text-sm font-semibold">{copied === "link" ? "Copied ✓" : "Copy link"}</button>
            <button onClick={saveCustomer} className="flex-1 rounded bg-slate-900 py-2 text-sm font-semibold text-white">Save customer</button>
          </div>
          {preset ? (
            <details className="rounded border border-amber-300 bg-amber-50 p-2 text-sm">
              <summary className="cursor-pointer font-semibold">Before sending: make their demo (tap to see)</summary>
              <p className="mt-2 text-xs text-slate-600">Paste this in your presets file, save, and deploy. Then the link above will show their business name.</p>
              <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-xs">{preset}</pre>
              <button onClick={() => copy("preset", preset)} className="mt-2 rounded border bg-white px-3 py-1.5 text-xs font-semibold">{copied === "preset" ? "Copied ✓" : "Copy this code"}</button>
            </details>
          ) : (
            <p className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-slate-700">
              This product has no preset. Open <b>{`/${P.path}`}</b>, edit it with their details, then use <b>Share link</b> inside the Edit panel. Send that short link instead of the one above.
            </p>
          )}
        </section>

        {/* STEP C */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">Step 3: Pick language, then copy and send</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[["en", "English"], ["hi", "हिन्दी"], ["kn", "ಕನ್ನಡ"]].map(([k, l]) => (
              <button key={k} onClick={() => setLang(k)} className="rounded-full py-2 text-sm font-semibold" style={lang === k ? { background: "#0f172a", color: "#fff" } : { background: "#f1f5f9" }}>{l}</button>
            ))}
          </div>
        </section>

        {STEPS.map(([k, title, when, where]) => {
          const text = T[lang][k](v);
          return (
            <section key={k} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-xs text-slate-500">{when}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {where === "wa" ? "WhatsApp" : where === "ig" ? "Instagram" : "In person"}
                </span>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-sm text-slate-800">{text}</pre>
              <div className="mt-2 flex gap-2">
                <button onClick={() => copy(k, text)} className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white">{copied === k ? "Copied ✓" : "Copy message"}</button>
                {where === "wa" && (
                  <a href={waLink(text)} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white">
                    {cu.phone ? "Send on WhatsApp" : "Open WhatsApp"}
                  </a>
                )}
              </div>
            </section>
          );
        })}

        {/* CUSTOMER LIST */}
        <section className="space-y-2 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">My customers ({list.length})</h2>
          {list.length === 0 && <p className="text-sm text-slate-500">Tap "Save customer" above to keep track of who you messaged.</p>}
          {list.map((x) => (
            <div key={x.id} className="rounded border p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <button className="min-w-0 truncate text-left font-semibold" onClick={() => setCu({ product: x.product, biz: x.biz, owner: x.owner, phone: x.phone, slug: x.slug })}>{x.biz}</button>
                <select className="rounded border px-2 py-1 text-xs" value={x.status} onChange={(e) => setList(list.map((y) => (y.id === x.id ? { ...y, status: e.target.value } : y)))}>
                  {STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{PRODUCTS[x.product].label} · {x.date}</span>
                <button className="text-red-600" onClick={() => confirm("Remove this customer?") && setList(list.filter((y) => y.id !== x.id))}>Remove</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}