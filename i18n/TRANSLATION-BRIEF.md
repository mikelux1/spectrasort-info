# Website translation brief — FR · DE · IT · ES · PT-BR

Read this whole file before translating. It is the contract for every localized page.

## What you are producing

One file per page: `i18n/<lang>/<slug>.md`. The file is the **inner HTML of `<main>`**, in the
target language, with a small front-matter block on top. A build script
(`scripts/build-i18n.py`) wraps it with the localized nav, footer, language switcher, closing
CTA and JSON-LD. You do **not** write those, and you must not include them.

```
---
title: <browser title, one line, plain text>
description: <meta description, one line, plain text>
ogTitle: <social title, one line, plain text>
ogDescription: <social description, one line, plain text>
breadcrumb: <the page name in the target language, e.g. Tarifs>
---

<section class="page-hero">
  ... translated main content ...
</section>
... more sections ...
```

- `breadcrumb` is omitted only for `home`.
- Front-matter values are **plain text** — no HTML tags, no `&amp;`, no line breaks. Write `&`
  normally there; the generator escapes it.
- The body stops before the closing CTA. The last thing in your file is the “Keep reading”
  related-links section (if the English page has one). Never include
  `<section class="closing">`.

## Hard rules

1. **Keep the HTML skeleton identical.** Same tags, classes, ids, `href`s, `src`s, `width`,
   `height`, `loading`, `viewBox` and SVG path data. Translate text nodes, `alt`, `title`,
   `aria-label`, `figcaption`, `summary` and `content` where they are prose.
2. **No `<script>`, no `<style>`, no `<main>`, no `<nav>`, no `<footer>`.**
3. **One `<h1>` per page**, as in the English source. Keep the `<span class="grad-text">`
   split: translate the two halves separately so the coloured phrase still lands on a phrase
   that works in the target language.
4. **FAQ markup is structural.** Keep exactly:
   `<details class="faq-item"><summary>…</summary><div class="faq-answer">…</div></details>`.
   The generator reads it to build FAQPage structured data.
5. **Internal links.** A link to one of the 19 translated pages gets the language prefix:
   `href="/pricing/"` → `href="/fr/pricing/"`, `href="/"` → `href="/fr/"`. Links to
   `/privacy` and `/terms` stay English (the legal pages are not translated). Anchors
   (`#faq`) stay unchanged. **App Store links stay exactly as they are** — the script
   rewrites `/us/` to the right storefront from the page path.
6. **Do not translate:** SpectraSort · Studio · iPhone · iOS · App Store · Neural Engine ·
   Apple · Instagram · WeChat · Xiaohongshu · 光谱挑片. Feature names follow the official
   table below, capitalised exactly as shown.
7. **Numbers stay numbers:** 3.2 · 18.5 · 100 photos a second · 30 picks · five actions a week ·
   seven quality axes · up to three subjects · 2026. Translate the words around them, not the
   digits.
8. **No money figure anywhere.** Not `$19.99`, not `19,99 €`, not `R$`. This is the same rule
   the localised App Store listings follow: Apple charges in local currency, so a dollar
   figure would be wrong. Replace “$19.99 once” with the language's “one payment, no
   subscription” phrase. On the pricing page the Premium amount line becomes “one payment”,
   and the page says the local price is shown on the App Store before purchase. In the
   changelog's older entries, turn “$19.99” into “a single purchase” — keep the history, drop
   the figure.
9. **Never add a claim the English page does not make.** Translate meaning, not ambition.
10. **Tone.** Match the localised App Store description for your language (the approved
    reference is `3-planning/asc-metadata-v3.2-localized.md`). Short sentences, concrete
    numbers, outcome first. Register: FR **vous**, DE **du**, IT **tu**, ES **tú**, PT-BR
    **você**.

## Official vocabulary

Use these exactly. Source: `3-planning/localization-v3.2/glossaries/core-terms.md` and the
localised App Store metadata.

| English | fr | de | it | es | pt-BR |
|---|---|---|---|---|---|
| Best Shots | Meilleurs clichés | Beste Aufnahmen | Migliori scatti | Mejores fotos | Melhores fotos |
| Your Taste | Vos goûts | Dein Geschmack | Il tuo gusto | Tu gusto | Seu gosto |
| Find a Subject | Trouver un sujet | Motiv finden | Trova un soggetto | Buscar un sujeto | Encontrar um assunto |
| Like This Photo | Comme cette photo | Wie dieses Foto | Foto simili a questa | Como esta foto | Como esta foto |
| Dedupe | Doublons | Duplikate | Duplicati | Duplicados | Duplicatas |
| Photos of a location | Photos d'un lieu | Fotos von einem Ort | Foto di un luogo | Fotos de un lugar | Fotos de um lugar |
| Guided Mode | Mode guidé | Geführter Modus | Modalità guidata | Modo guiado | Modo Guiado |
| Batch Actions | Actions par lot | Stapelaktionen | Azioni multiple | Acciones en lote | Ações em lote |
| Autopick | Sélection auto | Auto-Auswahl | Autoselezione | Autoselección | Autoseleção |
| Studio | Studio | Studio | Studio | Studio | Studio |
| Picked / Kept / Discarded | Conservées / Gardées / Écartées | Behalten / Belassen / Verworfen | Conservate / Tenute / Scartate | Conservadas / Mantenidas / Descartadas | Mantidas / Guardadas / Descartadas |
| Scenes | Scènes | Szenen | Scene | Escenas | Cenas |
| Timeline | Chronologie | Zeitleiste | Cronologia | Cronología | Linha do tempo |
| Filters | Filtres | Filter | Filtri | Filtros | Filtros |
| Exclude | Exclure | Ausschließen | Escludi | Excluir | Excluir |
| Documents & receipts | Documents et reçus | Dokumente & Belege | Documenti e ricevute | Documentos y recibos | Documentos e recibos |
| Free | Gratuit | Kostenlos | Gratis | Gratis | Grátis |
| Premium | Premium | Premium | Premium | Premium | Premium |
| Subscription | Abonnement | Abo | Abbonamento | Suscripción | Assinatura |
| Restore Purchases | Restaurer les achats | Käufe wiederherstellen | Ripristina acquisti | Restaurar compras | Restaurar compras |
| Privacy Policy | Confidentialité | Datenschutz | Privacy | Privacidad | Privacidade |

Delete verb: FR Supprimer · DE Löschen · IT Elimina · ES Eliminar · PT Apagar.
Sort verb: FR Trier · DE Sortieren · IT Ordinare · ES Ordenar · PT Classificar.
Library: FR photothèque · DE Mediathek · IT libreria foto · ES fototeca · PT biblioteca de fotos.

## Per-page notes

- **home** — the longest page. Translate every section, including the nine FAQ entries and the
  pricing block. The pricing block must not show a figure; use “five actions a week free”,
  “one payment”, “no subscription”.
- **pricing** — extra care. Title/description without a figure. The Premium card's
  `.amount` line is the local “one payment” phrase. Keep the Free card's “5 actions a week”.
  The FAQ “Does the price differ by country?” becomes: Apple sets the local price for each
  storefront and the App Store shows it before purchase. No figure.
- **changelog** — translate every release in order, newest first. Keep version numbers and
  months. In 3.0 and 3.1, replace the dollar figure with “a single purchase”.
- **press** — keep the facts table structure. The “Languages” row lists all six languages in
  the target language. Contact and maker facts unchanged.
- **documents-receipts-iphone** — the 3.2 feature page. Use *Documents et reçus* etc. exactly.
- **landing pages** — the search-intent headings can be adapted to the natural query in the
  target language, but do not change what the page claims. Keep the internal links to the
  localized versions of the other landing pages.
- **studio** — “Studio” stays English. “seven quality axes”, “up to three subjects”, “balance
  wheel” use the app's localised wording where it exists.

## Self-check before you write each file

- [ ] Front matter has `title`, `description`, `ogTitle`, `ogDescription`, and `breadcrumb`
      (except home), each one line, plain text.
- [ ] Body starts with `<section class="page-hero">` and has no `<main>`, `<nav>`, `<footer>`,
      `<script>`, `<style>`, or closing CTA.
- [ ] Exactly one `<h1>`.
- [ ] Every internal link is either prefixed with `/<lang>/` or is `/privacy` / `/terms` /
      an anchor / an App Store URL.
- [ ] No currency figure anywhere.
- [ ] All tags balanced; quotes and accents are UTF-8.
- [ ] No English sentence left except the do-not-translate names.
- [ ] FAQ blocks still match the `<details class="faq-item">` structure.

Write the file with the Write tool. Do not edit the English page, the generator, the chrome
file, or another language's files.
