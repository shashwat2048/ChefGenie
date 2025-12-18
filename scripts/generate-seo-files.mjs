import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function loadDotEnvIfPresent(rootDir) {
  // Minimal dotenv loader (avoids adding a dependency).
  const candidates = ['.env.local', '.env', 'example.env'];
  for (const filename of candidates) {
    const p = path.join(rootDir, filename);
    if (!fs.existsSync(p)) continue;
    try {
      const raw = fs.readFileSync(p, 'utf8');
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        // Strip wrapping quotes: KEY="value" or KEY='value'
        value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // ignore
    }
  }
}

function normalizeSiteUrl(raw) {
  // Handle common .env formatting like: VITE_SITE_URL= "https://example.com/"
  const cleaned = (raw || '')
    .trim()
    .replace(/^"(.*)"$/, '$1')
    .replace(/^'(.*)'$/, '$1')
    .trim()
    .replace(/\/+$/, '');
  const siteUrl = cleaned;
  if (!siteUrl) return '';
  try {
    const u = new URL(siteUrl);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

loadDotEnvIfPresent(rootDir);

const siteUrl =
  normalizeSiteUrl(process.env.VITE_SITE_URL) ||
  normalizeSiteUrl(process.env.SITE_URL);

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// For now the app is a single-page site. Add more routes here if you add pages later.
const routes = ['/'];
const nowIso = new Date().toISOString();

const xmlEscape = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((r) => {
    const loc = siteUrl ? `${siteUrl}${r}` : r;
    return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${r === '/' ? '1.0' : '0.7'}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl ? `${siteUrl}/sitemap.xml` : '/sitemap.xml'}
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');

console.log(
  `[seo] wrote public/sitemap.xml and public/robots.txt ${siteUrl ? `for ${siteUrl}` : '(no SITE_URL set; using relative URLs)'}`
);


