/* ============================================================================
   SpectraSort site — Firebase Analytics.
   Lifted from the v3 draft (assets/site.js) and trimmed for the single-page
   v3.2: the multi-page section helpers and the light/dark preview toggle are
   gone, the sticky CTA and the pricing block are new.

   Loaded as its own module, separate from site.js, so that a blocked or failed
   Firebase CDN request cannot take the page's interactions down with it.

   NOTE: the Firebase web config below is public by design — it ships to every
   browser that loads the live site. It is not a secret credential.
   ========================================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyCDaOOlELzAJiglwkz4r07VvSKKZ9wVd-Q",
    authDomain: "spectrasort-website.firebaseapp.com",
    projectId: "spectrasort-website",
    storageBucket: "spectrasort-website.firebasestorage.app",
    messagingSenderId: "265127429107",
    appId: "1:265127429107:web:540f38b6a35e1a03d9c886",
    measurementId: "G-Y18XHGYQB9"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

/* ---------- explicit page_view (full attribution incl. path) ------------ */
logEvent(analytics, "page_view", {
    page_location: window.location.href,
    page_title: document.title,
    page_path: window.location.pathname + window.location.search
});

/* ---------- helpers ------------------------------------------------------ */
const APP_STORE_HOST = "apps.apple.com";
const SITE_HOST = location.hostname;

function getSection(el) {
    if (el.closest("nav.top")) return "nav";
    if (el.closest("footer")) return "footer";
    if (el.closest(".sticky-cta") || el.closest(".zh-stickybar")) return "sticky_cta";
    if (el.closest(".closing")) return "closing";
    const s = el.closest("section[id]");
    return s ? s.id : "unknown";
}
function classifyLink(href) {
    if (!href) return "anchor";
    if (href.startsWith("mailto:")) return "email";
    if (href.startsWith("tel:")) return "phone";
    if (href.startsWith("#")) return "anchor";
    try {
        const url = new URL(href, location.href);
        if (url.hostname === APP_STORE_HOST) return "app_store";
        if (url.hostname && url.hostname !== SITE_HOST) return "external";
    } catch (e) { /* relative path */ }
    return "internal";
}
function ctaLocation(el) {
    if (el.closest("nav.top")) return "nav";
    if (el.closest(".hero") || el.closest(".page-hero")) return "hero";
    if (el.closest(".sticky-cta") || el.closest(".zh-stickybar")) return "sticky";
    if (el.closest("#pricing")) return "pricing";
    if (el.closest(".closing")) return "closing";
    const s = el.closest("section[id]");
    return s ? s.id : null;
}

/* ---------- delegated link clicks + CTA + outbound ---------------------- */
document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    const linkType = classifyLink(href);
    const linkText = (a.textContent || "").trim().slice(0, 80);
    const section = getSection(a);

    logEvent(analytics, "link_click", {
        link_text: linkText, link_url: href || "",
        link_section: section, link_type: linkType
    });

    if (linkType === "app_store" && (a.classList.contains("cta") || a.classList.contains("cta-small"))) {
        logEvent(analytics, "cta_click", { cta_location: ctaLocation(a) || "unknown", cta_text: linkText });
    }
    if (linkType === "app_store" || linkType === "external" || linkType === "email") {
        try {
            const url = new URL(href, location.href);
            logEvent(analytics, "outbound_click", { domain: url.hostname || linkType, link_url: href });
        } catch (e) {
            logEvent(analytics, "outbound_click", { domain: linkType, link_url: href });
        }
    }
});

/* demo_chip_click handler removed 2026-08-30 — the rank demo (.dchip) left the
   page in the v4 rewrite and the event never fired again (analytics review). */

/* ---------- FAQ opens ---------------------------------------------------- */
document.querySelectorAll(".faq-item").forEach((d) => {
    d.addEventListener("toggle", () => {
        if (!d.open) return;
        const q = (d.querySelector("summary")?.textContent || "").trim().slice(0, 80);
        logEvent(analytics, "faq_open", { faq_question: q });
    });
});

/* ---------- section_view via IntersectionObserver ----------------------- */
const sections = Array.from(document.querySelectorAll("section[id]"));
const sectionIndex = new Map(sections.map((s, i) => [s.id, i]));
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        logEvent(analytics, "section_view", {
            section_id: entry.target.id,
            section_index: sectionIndex.get(entry.target.id) ?? -1
        });
        sectionObserver.unobserve(entry.target);
    });
}, { threshold: 0.3 });
sections.forEach((s) => sectionObserver.observe(s));

/* ---------- scroll_depth milestones ------------------------------------- */
const milestones = [25, 50, 75, 90, 100];
const fired = new Set();
let scrollTimer = null;
function recordScroll() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const viewport = window.innerHeight;
    const total = doc.scrollHeight - viewport;
    if (total <= 0) return;
    const pct = Math.min(100, Math.round(((scrollTop + viewport) / doc.scrollHeight) * 100));
    for (const m of milestones) {
        if (pct >= m && !fired.has(m)) { fired.add(m); logEvent(analytics, "scroll_depth", { depth_percent: m }); }
    }
}
window.addEventListener("scroll", () => {
    if (scrollTimer) return;
    scrollTimer = setTimeout(() => { scrollTimer = null; recordScroll(); }, 250);
}, { passive: true });
recordScroll();
