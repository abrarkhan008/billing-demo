// ====== ONE BLOCK PER CUSTOMER. Copy a block, change the name and the details. ======
// Link for billing demo:  yoursite.com/bill/priya
// Link for website demo:  yoursite.com/site/priya
// The name in the link (priya) must match the name before the colon below.
// Photos: put files in  public/images/priya/  and write the path like "/images/priya/1.jpg"
// Logo:   put file in   public/logos/          and write "/logos/priya.png"

export const billPresets = {
  priya: {
    company: "Priya Mehendi Art",
    tagline: "Bridal & Festival Mehendi",
    logo: "",
    address: "MG Road, Bengaluru - 560001",
    phone: "9999999999",
    gstin: "",
    color: "#9d174d",
    showGst: false,
    terms: "50% advance to confirm booking.",
    footer: "Thank you for choosing us!",
    wmOn: false,
  },
  ravi: {
    company: "Ravi Welding Works",
    tagline: "Gates, Grills & Steel Fabrication",
    address: "Peenya, Bengaluru - 560058",
    phone: "8888888888",
    color: "#1d4ed8",
    gst: 18,
    showGst: true,
  },
};

export const sitePresets = {
  priya: {
    name: "Priya Mehendi Art",
    tagline: "Bridal & Festival Mehendi Designs",
    phone: "9999999999",
    whatsapp: "919999999999",
    insta: "priya_mehendi",
    address: "MG Road, Bengaluru",
    color: "#9d174d",
    about: "10 years of experience in bridal, Arabic and Rajasthani mehendi. We come to your home.",
    hero: "/images/priya/hero.jpg",
    gallery: ["/images/priya/1.jpg", "/images/priya/2.jpg", "/images/priya/3.jpg"],
    services: [
      { title: "Bridal", price: "₹3,000 onwards", text: "Full hands + legs" },
      { title: "Arabic", price: "₹500 onwards", text: "Quick and elegant" },
      { title: "Party", price: "₹300 onwards", text: "Festival and functions" },
    ],
    steps: "Choose your design from the gallery\nMessage us on WhatsApp with your date\nWe confirm your booking\nEnjoy your beautiful look",
    reviews: [
      { who: "Anita", text: "Colour came out so dark!" },
      { who: "Sneha", text: "Very neat work and on time." },
    ],
  },
};