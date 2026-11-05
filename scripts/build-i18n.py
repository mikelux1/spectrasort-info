#!/usr/bin/env python3
"""Build the five localized copies of the marketing site.

Source of truth for each page is `i18n/<lang>/<slug>.md`: a small front-matter
block (title, description, ogTitle, ogDescription, optional breadcrumb) followed
by the translated inner HTML of <main>, without the closing CTA. Shared chrome —
nav, footer, language switcher, closing CTA, structured data — comes from
`i18n/chrome.json` here, so every page in a language is identical at the edges
and a footer edit is one edit, not 95.

Run from the site root:  python3 -I scripts/build-i18n.py
"""

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / 'i18n'
BASE = 'https://spectrasort.app'
APP_ID = '6757512134'
APP_SLUG = 'spectrasort-ai-photo-picker'
DATE = '2026-10-31'

# English slug -> output path. `home` is the only one without a slug segment.
PAGES = [
    ('home', ''),
    ('features', 'features'),
    ('pricing', 'pricing'),
    ('studio', 'studio'),
    ('changelog', 'changelog'),
    ('documents-receipts-iphone', 'documents-receipts-iphone'),
    ('press', 'press'),
    ('ai-photo-picker-iphone', 'ai-photo-picker-iphone'),
    ('photo-culling-iphone', 'photo-culling-iphone'),
    ('best-photo-picker', 'best-photo-picker'),
    ('find-best-photos-iphone', 'find-best-photos-iphone'),
    ('duplicate-photo-finder-iphone', 'duplicate-photo-finder-iphone'),
    ('photo-organizer-iphone', 'photo-organizer-iphone'),
    ('private-ai-photo-app', 'private-ai-photo-app'),
    ('ai-photo-organizer-vs-apple-photos', 'ai-photo-organizer-vs-apple-photos'),
    ('spectrasort-vs-google-photos', 'spectrasort-vs-google-photos'),
    ('ai-photo-picker-vs-photo-culling', 'ai-photo-picker-vs-photo-culling'),
    ('how-to-pick-best-photos-from-camera-roll', 'how-to-pick-best-photos-from-camera-roll'),
    ('vacation-photos-iphone', 'vacation-photos-iphone'),
]

LANGS = [
    ('en', 'English', '', 'en'),
    ('fr', 'Français', 'fr', 'fr'),
    ('de', 'Deutsch', 'de', 'de'),
    ('it', 'Italiano', 'it', 'it'),
    ('es', 'Español', 'es', 'es'),
    ('pt', 'Português', 'pt', 'pt-BR'),
]

STORE_NAMES = [('fr', 'FR'), ('de', 'DE'), ('it', 'IT'), ('es', 'ES'), ('br', 'PT')]

APPLE_SVG = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.05 12.04c-.02-2.16 '
             '1.77-3.2 1.85-3.25-1.01-1.48-2.59-1.68-3.14-1.7-1.33-.13-2.61.78-3.29.78-.69 '
             '0-1.73-.76-2.85-.74-1.46.02-2.83.85-3.59 2.17-1.54 2.66-.39 6.59 1.1 8.75.73 '
             '1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.85.69 1.18-.02 '
             '1.92-1.07 2.64-2.13.84-1.22 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.34-3.58zM14.95 '
             '5.6c.61-.74 1.02-1.77.9-2.8-.88.04-1.94.58-2.57 1.31-.56.65-1.06 1.7-.93 '
             '2.71.98.07 1.99-.5 2.6-1.22z"/></svg>')

PAGE_CSS = {
    'changelog': '''  .release { padding:34px 0; border-top:1px solid var(--hairline); }
  .release:first-of-type { border-top:0; padding-top:0; }
  .release h2 { display:flex; align-items:baseline; gap:14px; flex-wrap:wrap; }
  .release h2 .when { font-family:var(--font-text); font-size:14px; font-weight:500; color:var(--text-low); letter-spacing:0.04em; }
  .release h3 { font-size:13px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-low); margin:22px 0 6px; }
  .release ul { margin:6px 0 0 18px; }
  .release li { margin:4px 0; }''',
    'press': '''  .press-shots { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-top:26px; }
  .press-shots figure { margin:0; }
  .press-shots img { width:100%; height:auto; display:block; border-radius:14px; border:1px solid var(--hairline); }
  .press-shots figcaption { font-size:12.5px; color:var(--text-low); margin-top:8px; line-height:1.45; }
  .press-kit { display:flex; flex-wrap:wrap; gap:14px; align-items:center; margin:22px 0 8px; }
  @media (max-width:760px){ .press-shots { grid-template-columns:1fr; } }''',
}


def esc(s):
    return html.escape(s, quote=True)


def read_fragment(path):
    raw = path.read_text(encoding='utf-8')
    if not raw.startswith('---'):
        return {}, raw
    end = raw.find('\n---', 3)
    head = raw[3:end].strip('\n')
    body = raw[end + 4:].lstrip('\n')
    meta = {}
    for line in head.splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    return meta, body


def page_url(prefix, slug):
    return BASE + '/' + (prefix + '/' if prefix else '') + (slug + '/' if slug else '')


def faq_items(main_html):
    out = []
    for q, a in re.findall(
            r'<details class="faq-item"><summary>(.*?)</summary><div class="faq-answer">(.*?)</div></details>',
            main_html, re.S):
        clean = lambda x: html.unescape(re.sub(r'<[^>]+>', '', x)).strip()
        out.append((clean(q), clean(a)))
    return out


def lang_menu(lang, cfg, slug):
    """One globe control for all six website languages, plus the 中文 site."""
    codes = {'en': 'EN', 'fr': 'FR', 'de': 'DE', 'it': 'IT', 'es': 'ES', 'pt': 'PT'}
    rows = []
    for code, label, prefix, tag in LANGS:
        href = '/' + (prefix + '/' if prefix else '') + (slug + '/' if slug else '')
        cur = ' aria-current="page"' if code == lang else ''
        rows.append(f'        <a href="{href}" hreflang="{tag}" lang="{tag}"{cur}>{label}</a>')
    rows.append('        <a href="/zh/" hreflang="zh-Hans" lang="zh-Hans">中文</a>')
    return f'''    <details class="lang-menu">
      <summary aria-label="{esc(cfg['footer']['language'])}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9M12 3c-2.5 2.6-3.8 5.7-3.8 9s1.3 6.4 3.8 9"/></svg>
        {codes[lang]}
        <svg class="chev" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>
      </summary>
      <div class="lang-menu-panel">
{chr(10).join(rows)}
      </div>
    </details>'''


def build_head(lang, cfg, slug, meta):
    prefix = lang
    url = page_url(prefix, slug)
    title = meta.get('title', 'SpectraSort')
    desc = meta.get('description', '')
    og_title = meta.get('ogTitle', title)
    og_desc = meta.get('ogDescription', desc)
    alts = []
    for code, label, pref, tag in LANGS:
        alts.append(f'<link rel="alternate" hreflang="{tag}" href="{page_url(pref, slug)}">')
    if slug == '':
        alts.append('<link rel="alternate" hreflang="zh-Hans" href="https://spectrasort.app/zh/">')
    alts.append(f'<link rel="alternate" hreflang="x-default" href="{page_url("", slug)}">')

    blocks = []
    if slug:
        blocks.append({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'SpectraSort', 'item': BASE + '/' + prefix + '/'},
                {'@type': 'ListItem', 'position': 2, 'name': meta.get('breadcrumb', title),
                 'item': url},
            ],
        })
    app = {
        '@context': 'https://schema.org', '@type': 'SoftwareApplication',
        '@id': BASE + '/#app', 'name': 'SpectraSort',
        'applicationCategory': 'PhotographyApplication', 'operatingSystem': 'iOS 18.5+',
        'url': BASE, 'description': desc, 'softwareVersion': '3.2', 'dateModified': DATE,
        'downloadUrl': f'https://apps.apple.com/{cfg["store"]}/app/{APP_SLUG}/id{APP_ID}',
        'inLanguage': cfg['htmlLang'],
        'availableLanguage': ['en', 'fr', 'de', 'it', 'es', 'pt'],
        'author': {'@type': 'Person', 'name': 'Mike Lu'},
    }
    if slug == '':
        blocks.append(app)
    elif slug == 'press':
        blocks.append({
            '@context': 'https://schema.org', '@type': 'AboutPage', '@id': url,
            'url': url, 'name': title, 'description': desc, 'dateModified': DATE,
            'inLanguage': cfg['htmlLang'], 'about': {'@id': BASE + '/#app'},
            'author': {'@type': 'Person', 'name': 'Mike Lu'},
        })
        blocks.append(app)
    else:
        blocks.append({
            '@context': 'https://schema.org', '@type': 'Article', '@id': url + '#article',
            'headline': title, 'description': desc, 'inLanguage': cfg['htmlLang'],
            'url': url, 'mainEntityOfPage': {'@type': 'WebPage', '@id': url},
            'dateModified': DATE, 'author': {'@type': 'Person', 'name': 'Mike Lu'},
            'publisher': {'@type': 'Organization', 'name': 'SpectraSort', 'url': BASE},
            'about': {'@id': BASE + '/#app'},
        })
        blocks.append(app)

    css = PAGE_CSS.get(slug)
    style = f'<style>\n{css}\n</style>\n' if css else ''
    lds = '\n'.join(
        '<script type="application/ld+json">\n' + json.dumps(b, ensure_ascii=False, indent=2) + '\n</script>'
        for b in blocks)

    return f'''<!DOCTYPE html>
<html lang="{cfg['htmlLang']}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="author" content="Mike Lu">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
{chr(10).join(alts)}

<meta property="og:type" content="website">
<meta property="og:site_name" content="SpectraSort">
<meta property="og:locale" content="{cfg['ogLocale']}">
<meta property="og:title" content="{esc(og_title)}">
<meta property="og:description" content="{esc(og_desc)}">
<meta property="og:image" content="https://spectrasort.app/og-image.png?v=3">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(cfg['ogImageAlt'])}">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(og_title)}">
<meta name="twitter:description" content="{esc(og_desc)}">
<meta name="twitter:image" content="https://spectrasort.app/og-image.png?v=3">

<meta name="apple-itunes-app" content="app-id={APP_ID}">
<link rel="icon" type="image/png" sizes="32x32" href="/images/app-icon-flat.png">
<link rel="apple-touch-icon" sizes="180x180" href="/images/app-icon-flat.png">
<meta name="theme-color" content="#0B0B0E">

{lds}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=20261101">
{style}</head>'''


def build_nav(lang, cfg, slug):
    p = '/' + lang
    active = {'': 'overview', 'features': 'features', 'pricing': 'pricing', 'changelog': 'changelog'}.get(slug)
    def a(key, path, label):
        cur = ' aria-current="page"' if key == active else ''
        return f'<a href="{path}"{cur}>{label}</a>'
    app_store = f'https://apps.apple.com/us/app/{APP_SLUG}/id{APP_ID}'
    return f'''<nav class="top">
  <div class="container">
    <a class="brand" href="{p}/"><img src="/images/app-icon-flat.png" alt="">SpectraSort</a>
    <div class="nav-links">
      {a('overview', p + '/', cfg['nav']['overview'])}
      {a('features', p + '/features/', cfg['nav']['features'])}
      {a('pricing', p + '/pricing/', cfg['nav']['pricing'])}
      {a('changelog', p + '/changelog/', cfg['nav']['changelog'])}
    </div>
    {lang_menu(lang, cfg, slug)}
    <a class="cta-small" href="{app_store}">{APPLE_SVG}
      {cfg['nav']['download']}
    </a>
  </div>
</nav>'''


def build_footer(lang, cfg, slug):
    p = '/' + lang
    f = cfg['footer']
    app_store = f'https://apps.apple.com/us/app/{APP_SLUG}/id{APP_ID}?ppid=5fd01708-3a73-4412-9bea-b411522af1f3'
    def col(title, links, store_link=False):
        items = '\n'.join(f'        <a href="{p}/{path}/">{label}</a>' for label, path in links)
        if store_link:
            items += f'\n        <a href="{app_store}">{f["appStore"]}</a>'
        return f'''      <div class="foot-col">
        <div class="fc-title">{title}</div>
{items}
      </div>'''
    also = ' &middot;\n      '.join(
        f'<a href="https://apps.apple.com/{store}/app/{APP_SLUG}/id{APP_ID}?ct=web_footer">{label}</a>'
        for store, label in STORE_NAMES)
    return f'''<footer>
  <div class="container">
    <div class="foot-grid">
      <div class="foot-col">
        <div class="foot-brand"><img src="/images/app-icon-flat.png" alt="">SpectraSort</div>
        <p>{f['blurb']}</p>
      </div>
{col(f['guides'], f['guideLinks'])}
{col(f['compare'], f['compareLinks'])}
{col(f['product'], f['productLinks'], store_link=True)}
    </div>
    <div class="foot-meta">
      <div>&copy; 2026 Mike Lu &middot; SpectraSort &middot; {f['updated']}</div>
      <div><a href="/privacy">{f['privacy']}</a><a href="/terms">{f['terms']}</a><a href="mailto:spectrasortapp@gmail.com">{f['support']}</a></div>
    </div>
    <div class="also-in">{f['alsoIn']}:
      {also}
    </div>
  </div>
</footer>'''


def build_closing(cfg, lang):
    app_store = f'https://apps.apple.com/us/app/{APP_SLUG}/id{APP_ID}?ppid=5fd01708-3a73-4412-9bea-b411522af1f3'
    c = cfg['closing']
    return f'''<section class="closing">
  <div class="container rv">
    <h2>{c['h2']} <span class="grad-text">{c['grad']}</span></h2>
    <p>{c['sub']}</p>
    <a class="cta" href="{app_store}">{APPLE_SVG}
      {c['cta']}
    </a>
  </div>
</section>'''


# Campaign codes for App Store links, mirroring CT_BY_PATH in assets/site.js.
CT_BY_PATH = {
    '/': 'web_home',
    '/ai-photo-picker-iphone/': 'web_aipicker',
    '/photo-culling-iphone/': 'web_culling',
    '/best-photo-picker/': 'web_bestpicker',
    '/find-best-photos-iphone/': 'web_findbest',
    '/duplicate-photo-finder-iphone/': 'web_dupe',
    '/photo-organizer-iphone/': 'web_organizer',
    '/private-ai-photo-app/': 'web_privacy',
    '/ai-photo-organizer-vs-apple-photos/': 'web_vs_apple',
    '/spectrasort-vs-google-photos/': 'web_vs_google',
    '/ai-photo-picker-vs-photo-culling/': 'web_picker_vs_culling',
    '/how-to-pick-best-photos-from-camera-roll/': 'web_camera_roll',
    '/vacation-photos-iphone/': 'web_vacation',
    '/features/': 'web_features',
    '/pricing/': 'web_pricing',
    '/studio/': 'web_studio',
    '/changelog/': 'web_changelog',
    '/documents-receipts-iphone/': 'web_documents',
    '/press/': 'web_press',
}


def localise_store_links(html, cfg, slug):
    """Point every App Store link at this language's storefront, in the HTML.

    The shared chrome and the translated fragments were written with the US
    URL. site.js rewrites it in the browser, but crawlers and no-JS visitors
    only see the raw href, so the storefront and the campaign code are set
    here at build time instead.
    """
    ct = CT_BY_PATH.get('/' + slug + '/' if slug else '/',
                        'web_' + (slug.replace('-', '_') if slug else 'home'))

    def fix(m):
        url = m.group(0).replace('/us/', '/' + cfg['store'] + '/', 1)
        if 'ct=' not in url:
            url += ('&' if '?' in url else '?') + 'ct=' + ct
        return url

    return re.sub(r'https://apps\.apple\.com/us/app/[^"\s]+', fix, html)


def main():
    chrome = json.loads((I18N / 'chrome.json').read_text(encoding='utf-8'))
    missing = []
    built = 0
    for lang, cfg in chrome.items():
        outdir = ROOT / lang
        for key, slug in PAGES:
            src = I18N / lang / f'{key}.md'
            if not src.exists():
                missing.append(f'{lang}/{key}')
                continue
            meta, body = read_fragment(src)
            faqs = faq_items(body)
            schema_faq = ''
            if faqs:
                data = {
                    '@context': 'https://schema.org', '@type': 'FAQPage',
                    'mainEntity': [
                        {'@type': 'Question', 'name': q,
                         'acceptedAnswer': {'@type': 'Answer', 'text': a}}
                        for q, a in faqs
                    ],
                }
                schema_faq = ('<script type="application/ld+json">\n'
                              + json.dumps(data, ensure_ascii=False, indent=2)
                              + '\n</script>\n')
            page = build_head(lang, cfg, slug, meta)
            page += '\n<body>\n\n' + build_nav(lang, cfg, slug) + '\n\n<main>\n\n' + body.strip() + '\n\n' + build_closing(cfg, lang)
            # FAQ JSON-LD is appended to head, after the generated blocks.
            if schema_faq:
                page = page.replace('</head>', schema_faq + '</head>')
            page += '\n\n</main>\n\n' + build_footer(lang, cfg, slug)
            page += '\n\n<script src="/assets/site.js?v=20261101" defer></script>\n<script type="module" src="/assets/analytics.js"></script>\n</body>\n</html>\n'
            page = localise_store_links(page, cfg, slug)
            target = outdir / (slug + '/index.html' if slug else 'index.html')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(page, encoding='utf-8')
            built += 1
    print(f'built {built} pages')
    if missing:
        print('missing fragments:')
        for m in missing:
            print('  -', m)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
