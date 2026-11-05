// _middleware.js — markdown serving for The Wavy Society (Cloudflare Pages).
//
// Implements the ScrollLaunch Prompt 1 serving rules on a static site:
//   1. `.md` suffix:  GET /token.md -> markdown of /token.html.
//      Unknown .md -> markdown 404, never HTML. A real .md file that is
//      not a page (README.md) is left alone.
//   2. Content negotiation: GET /token with `Accept: text/markdown` ->
//      markdown, but only when text/markdown has a higher q than text/html.
//      `*/*` or a missing Accept header ALWAYS gets HTML.
//   3. Direct backend URL: GET /api/md/<page> always returns markdown.
//      GET /api/md/_catalog returns the static api/md/_catalog.json file
//      (served here because the extensionless URL does not map to it).
//
// Static .md files also carry markdown headers via _headers; this
// middleware is what adds X-Markdown-Tokens (per-file, computed here) and
// handles negotiation / 404s, which static hosting cannot do.
//
// Excluded from negotiation (pass through untouched): /llms.txt,
// /llms-full.txt, /ai.txt, /robots.txt, /sitemap.xml, /api/* (except the
// /api/md/<page> case above), static assets, and README.md.
//
// Keep the route table in sync with scripts/generate-ai-readable.mjs
// (PAGES registry). Adding a page = one entry there + one entry here.
// Last-Modified dates are content-change dates (git log), not rebuild dates.

const SITE = "https://wavysociety.pages.dev";

// slug -> { md, canonical, lastmod }
const PAGES = {
  index: {
    md: "/index.md",
    canonical: `${SITE}/`,
    lastmod: "2026-10-10",
  },
  token: {
    md: "/token.md",
    canonical: `${SITE}/token.html`,
    lastmod: "2026-10-10",
  },
  flow: {
    md: "/flow.md",
    canonical: `${SITE}/flow.html`,
    lastmod: "2026-10-05",
  },
  trust: {
    md: "/trust.md",
    canonical: `${SITE}/trust.html`,
    lastmod: "2026-10-10",
  },
};

// HTML path -> slug (bare path, /index, and the .html file all count).
const HTML_PATHS = {
  "/": "index",
  "/index": "index",
  "/index.html": "index",
  "/token": "token",
  "/token.html": "token",
  "/flow": "flow",
  "/flow.html": "flow",
  "/trust": "trust",
  "/trust.html": "trust",
};

const DESCRIBEDBY =
  `<${SITE}/llms.txt>; rel="describedby", ` +
  `<${SITE}/llms-full.txt>; rel="describedby", ` +
  `<${SITE}/ai.txt>; rel="describedby"`;

function markdownHeaders(page, tokens) {
  const h = new Headers();
  h.set("Content-Type", "text/markdown; charset=utf-8");
  h.set("X-Markdown-Tokens", String(tokens));
  h.set("X-Robots-Tag", "noindex, follow");
  h.set("Content-Location", page.canonical);
  h.set("Link", `<${page.canonical}>; rel="canonical"`);
  h.set("Vary", "Accept");
  h.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  h.set("Last-Modified", new Date(`${page.lastmod}T00:00:00Z`).toUTCString());
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Accept");
  return h;
}

function markdown404(request) {
  const body = "# Not found\n\n> No such page on The Wavy Society.\n\nCanonical: https://wavysociety.pages.dev/\n\n## Related\n\n- [Home](https://wavysociety.pages.dev/)\n- [Token Status](https://wavysociety.pages.dev/token.html)\n- [Trust Center](https://wavysociety.pages.dev/trust.html)\n";
  const h = new Headers();
  h.set("Content-Type", "text/markdown; charset=utf-8");
  h.set("X-Markdown-Tokens", String(Math.ceil(body.length / 4)));
  h.set("X-Robots-Tag", "noindex, follow");
  h.set("Vary", "Accept");
  h.set("Access-Control-Allow-Origin", "*");
  if (request.method === "HEAD") return new Response(null, { status: 404, headers: h });
  return new Response(body, { status: 404, headers: h });
}

function corsPreflight() {
  const h = new Headers();
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Accept");
  h.set("Vary", "Accept");
  return new Response(null, { status: 204, headers: h });
}

// Parse an Accept header into { mediaType: q }. Missing/invalid -> {}.
function parseAccept(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(",")) {
    const [type, ...params] = part.trim().split(";");
    if (!type) continue;
    let q = 1;
    for (const p of params) {
      const m = p.trim().match(/^q=([0-9.]+)$/);
      if (m) q = parseFloat(m[1]);
    }
    out[type.trim().toLowerCase()] = q;
  }
  return out;
}

function wantsMarkdown(request) {
  const accept = parseAccept(request.headers.get("Accept"));
  const mdQ = accept["text/markdown"] ?? 0;
  const htmlQ = accept["text/html"] ?? 0;
  // text/markdown must beat text/html. */* or a missing Accept header
  // (mdQ 0, or */* with no explicit markdown) must ALWAYS get HTML.
  return mdQ > 0 && mdQ > htmlQ;
}

async function serveMarkdown(context, page) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return corsPreflight();
  if (!env.ASSETS) return context.next(); // Pages without the assets binding: fall through to static serving.
  // Always fetch the asset with GET, even for a HEAD request: a HEAD fetch
  // returns an empty body, which would make X-Markdown-Tokens compute as 0.
  const asset = await env.ASSETS.fetch(
    new Request(new URL(page.md, request.url), { method: "GET" })
  );
  if (!asset.ok) return markdown404(request);
  const text = await asset.text();
  const headers = markdownHeaders(page, Math.ceil(text.length / 4));
  if (request.method === "HEAD") return new Response(null, { status: 200, headers });
  return new Response(text, { status: 200, headers });
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // --- /api/md/<page>: always markdown.
  // /api/md/_catalog has no file extension, so static hosting will NOT map
  // it to api/md/_catalog.json on its own — serve that JSON via ASSETS here.
  if (path.startsWith("/api/md/")) {
    const slug = path.slice("/api/md/".length).replace(/\/$/, "");
    if (slug === "_catalog" || slug === "_catalog.json") {
      if (request.method === "OPTIONS") return corsPreflight();
      if (!context.env.ASSETS) return context.next();
      const asset = await context.env.ASSETS.fetch(
        new Request(new URL("/api/md/_catalog.json", request.url), { method: "GET" })
      );
      if (!asset.ok) return markdown404(request);
      const h = new Headers();
      h.set("Content-Type", "application/json; charset=utf-8");
      h.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
      h.set("Access-Control-Allow-Origin", "*");
      if (request.method === "HEAD") return new Response(null, { status: 200, headers: h });
      return new Response(await asset.text(), { status: 200, headers: h });
    }
    const page = PAGES[slug];
    if (!page) return markdown404(request);
    return serveMarkdown(context, page);
  }

  // --- .md suffix: known page -> markdown; unknown -> markdown 404.
  // README.md is a real repo file, not a page: leave it alone.
  if (path.endsWith(".md")) {
    if (path === "/README.md") return context.next();
    const slug = path.slice(1, -3); // "/token.md" -> "token"
    const page = PAGES[slug];
    if (!page) return markdown404(request);
    return serveMarkdown(context, page);
  }

  // --- Content negotiation on known HTML routes only (allowlist, not denylist).
  const slug = HTML_PATHS[path];
  if (slug && wantsMarkdown(request)) {
    return serveMarkdown(context, PAGES[slug]);
  }

  // --- Everything else: serve normally, but advertise llms/ai files from
  // HTML content pages via a global Link: describedby header.
  const response = await context.next();
  if (slug && response.headers.get("Content-Type")?.includes("text/html")) {
    const headers = new Headers(response.headers);
    const existing = headers.get("Link");
    headers.set("Link", existing ? `${existing}, ${DESCRIBEDBY}` : DESCRIBEDBY);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
}
