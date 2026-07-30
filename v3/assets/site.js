/* ============================================================================
   SpectraSort site — shared analytics + preview theme toggle.
   Loaded as a module on every page. The initial theme class (no-FOUC) is set by
   a tiny inline snippet in each page <head>; this file wires the click handler
   and the Firebase Analytics events (page_view, link_click, cta_click,
   outbound_click, section_view, scroll_depth).
   NOTE: the Firebase web config below is public by design (it ships to every
   browser that loads the live site) — it is not a secret credential.
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
    if (el.closest("footer.site-footer")) return "footer";
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
    if (el.closest(".hero")) return "hero";
    if (el.closest(".page-hero")) return "page_hero";
    if (el.closest(".closing")) return "closing";
    return null;
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

/* ---------- preview-only theme cycle: system → light → dark ------------- */
(function () {
    const KEY = 'ss-preview-theme';
    const link = document.getElementById('theme-toggle');
    if (!link) return;
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const cur = localStorage.getItem(KEY);
        const next = cur === 'light' ? 'dark' : cur === 'dark' ? 'system' : 'light';
        document.body.classList.remove('theme-light', 'theme-dark');
        if (next === 'system') localStorage.removeItem(KEY);
        else { document.body.classList.add('theme-' + next); localStorage.setItem(KEY, next); }
    });
})();
