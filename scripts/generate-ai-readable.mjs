// generate-ai-readable.mjs — ScrollLaunch Prompt 1 + 2 for The Wavy Society.
//
// Single source of truth for every AI-readable artefact on this site:
//   index.md, flow.md, token.md, trust.md
//   llms.txt, llms-full.txt, ai.txt, robots.txt, sitemap.xml
//   api/md/_catalog.json
//
// Token facts (status chips, planned supply, Treasury Safe) are read from
// status.js at generation time — the same file the HTML pages read — so the
// markdown can never contradict the site. Page copy is transcribed from the
// HTML pages; nothing is invented. Planned mechanics are labelled "planned".
// The token has NOT launched: no contract address exists, and none is shown.
//
// Usage:
//   node scripts/generate-ai-readable.mjs          # (re)generate all files
//   node scripts/generate-ai-readable.mjs --check  # fail if any file is stale,
//                                                   # or a public HTML page
//                                                   # has no markdown renderer
// No dependencies. Node >= 18 (uses node:fs, node:path, node:url, node:vm).

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");

// ---------------------------------------------------------------- site config
// Keep in sync with status.js, index.html and the Organization JSON-LD in
// index.html. No social links exist for this site (tweetUrl / telegramUrl in
// index.html are empty) — do not invent any.
const SITE = {
  name: "The Wavy Society",
  url: "https://wavysociety.pages.dev",
  description:
    "$WAVY is a community utility token on Base. Holders unlock private marketplaces and a life-operations system that turns real money goals into one confirmed action.",
  logo: "https://wavysociety.pages.dev/coin.webp",
  tokenStatus: "Not launched",
};

// ------------------------------------------------------- facts from status.js
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(readFileSync(join(ROOT, "status.js"), "utf8"), sandbox);
const STATUS = sandbox.window.WAVY_STATUS; // [{label, text, state}]
const META = sandbox.window.WAVY_META; // {name, symbol, chain, contract, plannedStandard, treasurySafe, treasuryNote}
if (!Array.isArray(STATUS) || !META || META.contract !== null) {
  throw new Error(
    "generate-ai-readable: status.js did not load as expected (WAVY_META.contract must be null — no token exists yet)"
  );
}
const TREASURY = META.treasurySafe;
const BASESCAN_TREASURY = `https://basescan.org/address/${TREASURY}`;

const statusTable = STATUS.map(
  (s) => `| ${s.label} | ${s.text} |`
).join("\n");

// Last updated = last content change (git log per file), NOT the rebuild
// date. Update a date here only when that page's content actually changes.
const PAGES = [
  {
    slug: "index",
    html: "index.html",
    md: "index.md",
    path: "/",
    title: "$WAVY — The Wavy Society",
    summary:
      "$WAVY is a community utility token on Base that has not launched. The Wavy Society offers private marketplaces and a life-operations service; the Ship's Store presale is open and presale payments land in the Treasury Safe on Base.",
    lastmod: "2026-10-10",
    inLlmsFull: true,
  },
  {
    slug: "token",
    html: "token.html",
    md: "token.md",
    path: "/token.html",
    title: "Token Status — The Wavy Society",
    summary:
      "$WAVY has not launched. There is no contract address. Planned standard: 100B supply on Base, 85% liquidity, 15% creator vesting over 1 year with a 30-day cliff.",
    lastmod: "2026-10-10",
    inLlmsFull: true,
  },
  {
    slug: "flow",
    html: "flow.html",
    md: "flow.md",
    path: "/flow.html",
    title: "Capital Flow — The Wavy Society",
    summary:
      "How money moves through the Wavy Society today — presale payments to the Treasury Safe — and how the token would move at launch under the planned Bankr standard.",
    lastmod: "2026-10-05",
    inLlmsFull: true,
  },
  {
    slug: "trust",
    html: "trust.html",
    md: "trust.md",
    path: "/trust.html",
    title: "Trust Center — The Wavy Society",
    summary:
      "What is live, what is not, and what a pending certificate means. The token has not launched; a pending certificate is not a balance.",
    lastmod: "2026-10-10",
    inLlmsFull: true,
  },
];

// ------------------------------------------------------------- page bodies
// Transcribed from the HTML pages (main content only — no nav, footer,
// cookie banners, modals, tracking, or repeated sign-up CTAs). Interactive
// parts (wallet connect, store checkout, locker) are described, not
// reproduced as forms. All links are absolute and point at HTML URLs.
const BODIES = {
  index: `# $WAVY — The Wavy Society

> ${SITE.description}

Est. MMXXVI · 39°06′ N — 84°31′ W

## What membership bestows

Two instruments of utility, held to the highest standard of care.

### The Private Exchange

A market where you're the customer, not the product. Members-only venues with no feed, no noise, no ads trailing you — goods from makers who answer to the Society, at founder's pricing while the press runs.

### The Life Ledger

State a money goal in plain English — rent covered, a plan funded — and the course is drawn up for your review. One confirmation from you, then it's executed and receipted. Nothing sails without your order.

### The Standing Guard

Your money never sits with us. No custody, no loans, no fine-print exits — allowlisted destinations, guardian rules you set, and every single move needs your confirmation.

## How a voyage is plotted

1. **Chart the course** — Link your accounts and state your goal in plain English. The plan is drawn up for your review.
2. **Give the order** — One confirmation. Nothing sails without it — every sum, every destination, in the open.
3. **Make port** — We execute, then issue a receipt. A real outcome, on the record.

## Sign the manifest

Declare your vessel to receive your Certificate of Membership — then strike your Harbor Pass, a one-of-one piece of nautical artwork unique to your crew number. Certificates are issued during prelaunch.

- The manifest is four marks, in order: name your vessel, take the oath, declare your wallet, strike your harbor pass. Complete all four and your certificate is issued — pending the token launch. Every mark is free.
- To declare your vessel, connect your Base wallet — your certificate is issued to it. No wallet handy? Paste the address instead.
- The Harbor Pass is a one-of-one nautical collectible, generated unique to your crew number — about one strike in twelve comes up gilt. Struck during prelaunch as a keepsake; the artwork and metadata are built to the ERC-721 standard, ready for the Society marketplace when it opens.

## The Ship's Store

Carry the Society with you — fly the burgee, pocket the compass, wear the tee, seal your letters in wax, and take your place on the Founder's Wall. Every piece made to order, never warehoused.

The first private marketplace — open now. Pay today at founder's pricing and save 20%, or reserve and pay at launch. Every order becomes a receipt in your locker, ready to sail into the life-ops dashboard the day it opens.

| Product | Founder's price (pay now) | Launch price | Description |
| --- | --- | --- | --- |
| The Society Burgee | $36 | $45 | Embroidered pennant, brass grommets. Fly it proudly. |
| Brass Compass | $68 | $85 | Engraved with the Society rose. Never lose the tide. |
| Linen Tee | $78 | $98 | White linen, salmon embroidery. "Stay wavy, baby." |
| Wax Seal Kit | $95 | $120 | Custom brass seal stamp with Society monogram, wax sticks, gift set. |

Founder's pricing ends at launch — pay now by card or crypto and save 20%. Prefer to wait? Choose Reserve and we'll write to you.

- Pay now, save 20% — founder's pricing for those who back the voyage early, or reserve and pay at launch.
- We write at launch — when $WAVY launches you get first word, with a private payment link.
- Pay and receive — pay in $WAVY or by card. We make it fresh and ship it to your door.
- Payment: card through Stripe, or crypto to the Treasury Safe. Crypto lands directly in the on-chain treasury, visible on Basescan within minutes. Card takes the long way — card to bank, then a manual transfer into the treasury with full accounting; allow 7–10 days before a card payment appears in the treasury ledger.
- The store sells memorabilia. It does not sell WAVY, and paying the store does not buy tokens.

## Your locker

Your reservations and gifts, kept in one manifest — on this device, under your wallet. When the life-ops dashboard launches, everything here comes with you: same wallet, same receipts.

## Carved in brass — the Founder's Wall

Reserve your plaque on the Founder's Wall — your vessel's name engraved permanently, for all the Society to see. $25 at launch — or $20 founder's pricing if you pay now. Once engraved, always engraved. Presale — no payment collected today. We'll write to you at launch.

## The fine print, in plain type

### Status

| Component | Status |
${statusTable}

### Facts

| Fact | Value |
| --- | --- |
| Standard | Bankr Doppler launch (planned) |
| Chain | Base |
| Supply (planned) | 100,000,000,000 WAVY · fixed |
| Split (planned) | 85% liquidity · 15% creator vesting (1 yr, 30-day cliff) |
| Treasury | WAVY Treasury Safe, \`${TREASURY}\` |

### A word of caution

Nothing here is promised but the voyage itself. Verify every contract address before you act. Never share your seed phrase — the Society will never ask for it. Launching soon on Bankr.

- **A pending certificate is not a balance.** Your certificate, crew code, and Harbor Pass are reserved for you — they cannot be spent, transferred, or redeemed until the token launches.
- **The token is not launched.** $WAVY does not exist on-chain yet. Until launch there is no contract, no price, and no market — the real contract address will be published here first, and anywhere else is not $WAVY.
- **The Life Ledger is a preview.** The dashboard in the Chart isn't connected today and no money can move through it. When it opens, nothing sails without your confirmation.
`,
  token: `# Token Status — The Wavy Society

> $WAVY has not launched. There is no contract address. Planned standard: 100B supply on Base, 85% liquidity, 15% creator vesting over 1 year with a 30-day cliff.

## At a glance

| Fact | Value |
| --- | --- |
| Status | **Not launched** — no token exists |
| Symbol | **WAVY** — reserved, not deployed |
| Network | **Base** — and only Base, at launch |
| Contract | **Not published.** There is no address because there is no token. |
| Planned standard | Bankr Doppler — 100B supply · 85% liquidity / 15% creator vesting (1 year, 30-day cliff) · metadata immutable at launch |
| Decimals | 18 (planned) |
| Creator share | 0.665% to the deployer — Bankr standard |
| Launch protections | 14-second anti-snipe, 5-minute 2% wallet cap — Bankr standard |
| Treasury Safe | \`${TREASURY}\` — deployed on Base, single owner · presale payments land here. [View on Basescan](${BASESCAN_TREASURY}) |
| Launch date | **Not scheduled.** The standard is chosen; the launch is not. |

## Warning

There is no contract yet. If anyone shows you a "WAVY" address before one appears on this page, it is not WAVY. When the token launches, its address will be published here first.

Certificates are pending and the token has not launched. A pending certificate is not a balance. Presale payments land in the Treasury Safe. Nothing here is financial advice.
`,
  flow: `# Capital Flow — The Wavy Society

> How money moves through the Society today, and how the token will move at launch — hop by hop.

## Today — presale to the Treasury

This flow is real and running. Card and crypto payments for the Ship's Store land in the Treasury Safe — one address, published below, nowhere else.

Treasury Safe: \`${TREASURY}\`

1. **Reserve at the Ship's Store** (open today) — Burgee, compass, tee, seals, founder's plaque — wallet plus email, no payment yet.
2. **Payment is taken** (on launch terms) — Card through Stripe, or crypto sent to the Treasury Safe. Founder pricing: 20% off launch.
3. **Funds land in the Treasury Safe** (live) — \`${TREASURY}\` — on Base, single owner. Presale money goes here and nowhere else.

## At launch — token to you (planned)

The planned shape of the launch, per the Bankr standard the Society will use. Every hop below is pre-launch — this shows the design, not a live rail. Dashed boxes are the plan — nothing here is connected and no token exists.

1. **Launch via Bankr on Base** (pre-launch) — The standard is chosen; the launch itself is not scheduled.
2. **100B WAVY minted — 85% to liquidity, 15% vesting** (pre-launch) — Vesting runs one year with a 30-day cliff. Metadata is immutable at launch.
3. **Manifest certificates honored** (pre-launch) — Pending certificates convert under the terms published at launch.

Presale payments are real and land in the Treasury Safe. Token flows are planned — no token exists, and no money moves on those rails today.
`,
  trust: `# Trust Center — The Wavy Society

> What is live, what is not, and what a pending certificate actually is. Written to be read in five minutes.

## How the manifest works

The manifest is the Society's muster roll — four marks, in order: name your vessel, take the oath, declare your wallet, strike your harbor pass. Complete all four and your certificate is issued — pending the token launch. The manifest is open today, and every mark is free.

## What "pending" means

**A pending certificate is not a balance.** No WAVY exists yet, so nothing has been sent to you and nothing is held in an account in your name. It is a recorded place in line — nothing more.

The form and timing of any recognition are set by the terms published at launch, not by anything written before. **If launch does not happen, a pending certificate has no value.**

## What is live and what is not

This list is generated from the same configuration that drives every status label on this site — the page cannot say one thing here and another elsewhere.

| Component | Status |
${statusTable}

## Token status

The WAVY token **has not launched**. There is no contract address, no price, and no market. The launch standard — and the Treasury Safe, which is already deployed — are published on the Token page. **Treat any contract address you see anywhere else as fake.**

## Fair launch

Fairness here is a structure, not a claim. Every item below is checkable — most of them on-chain at launch:

- **85% of supply goes to the liquidity pool.** The team keeps 15% — locked for a year with a 30-day cliff, so nothing unlocks before day 30. The founder locked himself up first.
- **100B fixed. No mint function.** No more can ever be created.
- **Fees go to the published Treasury Safe** (\`${TREASURY}\`) — set permanently at launch. Never a personal wallet, never reassignable.
- **Anti-snipe at the open:** 14-second fee decay plus a 5-minute 2% wallet cap, so bots don't eat the launch.
- **No profit promises, ever.** Copy describes access and utility — never returns. No engagement-farmed drops, no "like and repost or you get nothing."
- **Named founder, building in public.** No anonymous team to hide behind.

**What we haven't done yet** — stated, not hidden: independent legal review and a third-party security audit are both **waiting**. We will seek counsel as soon as we can afford it or find a free one, and commission an audit when the treasury can fund one. The full fifteen-marker audit — every red flag checked, with what would change its verdict — is kept with the launch record.

## Ship's Store terms

The Ship's Store sells **memorabilia** — burgee, brass compass, linen tee, wax seals, founder's plaque. It does not sell WAVY, and **paying the store does not buy tokens**. Reservations hold founder pricing (20% off launch); payment is taken on launch terms, by card or crypto.

Every presale payment lands in the **Treasury Safe** and nowhere else. Products without a payment link stay reserve-only until their terms are set.

## Crew codes

Your crew code is derived from your wallet — share it, and the Society knows who sailed you in. Crew codes carry **standing, not payment**: they mark who brought whom into the harbor, never a balance. One sailor, one code.

## Privacy

The manifest and the store ask for **your wallet address and your email** — nothing else. Declaring your vessel reads your address from your own wallet; we never see, ask for, or store anything beyond what you hand us.

## Security

**We will never ask for a seed phrase or a private key.** The Treasury Safe address is published on the Token page first — treat any other payment address as fake. Messages offering early WAVY, bonus allocations, or "support" are not from the Society.

## Risks

- **The token does not exist.** Launch may be delayed, changed, or cancelled. If it never launches, a pending certificate has no value.
- **The store sells memorabilia, not WAVY.** A presale payment buys goods, never tokens.
- **A token can lose some or all of its value.** Anything counted in WAVY will carry that risk.
- **Third-party rails have their own terms.** Stripe, Bankr, and Base can change theirs, and we do not control them.
- **The Life Ledger is a preview.** It cannot move money today, and previews are not promises.
- **Nothing here is financial advice**, and joining the Society is not an investment.
`,
};

const RELATED = {
  index: [
    ["Trust Center", `${SITE.url}/trust.html`],
    ["Capital Flow", `${SITE.url}/flow.html`],
    ["Token Status", `${SITE.url}/token.html`],
  ],
  token: [
    ["Trust Center", `${SITE.url}/trust.html`],
    ["Capital Flow", `${SITE.url}/flow.html`],
    ["Home", `${SITE.url}/`],
  ],
  flow: [
    ["Trust Center", `${SITE.url}/trust.html`],
    ["Token Status", `${SITE.url}/token.html`],
    ["Home", `${SITE.url}/`],
  ],
  trust: [
    ["Token Status", `${SITE.url}/token.html`],
    ["Capital Flow", `${SITE.url}/flow.html`],
    ["Home", `${SITE.url}/`],
  ],
};

// Title + summary + canonical + lastmod, in that order, then the body
// (the body's own "# title" / "> summary" lines are stripped to avoid
// duplication), then Related links.
function renderMdSpec(page) {
  const canonical = page.path === "/" ? SITE.url + "/" : SITE.url + page.path;
  const raw = BODIES[page.slug].trimEnd();
  const lines = raw.split("\n");
  // Drop the body's own "# title" line and "> summary" line (lines 0-2).
  const body = lines.slice(3).join("\n").trimStart();
  const related = RELATED[page.slug]
    .map(([text, url]) => `- [${text}](${url})`)
    .join("\n");
  return `# ${page.title}\n\n> ${page.summary}\n\nCanonical: ${canonical}\nLast updated: ${page.lastmod}\n\n${body}\n\n## Related\n\n${related}\n`;
}

function llmsTxt() {
  const core = PAGES.map(
    (p) =>
      `- [${p.title}](${SITE.url}/${p.md}): ${p.summary}`
  ).join("\n");
  return `# ${SITE.name}

> ${SITE.description} The token has not launched: there is no contract address, no price, and no market. The planned launch standard is Bankr Doppler on Base — 100B fixed supply, 85% liquidity, 15% creator vesting over 1 year with a 30-day cliff. Presale payments land in the Treasury Safe on Base.

The Wavy Society is a pre-launch community on Base. Membership bestows entry to private marketplaces and a life-operations service that turns real money goals into one confirmed action, with the member's consent, guardian rules, and allowlisted exits. The Ship's Store (memorabilia presale) is open; the Life Ledger is a preview and is not connected. Founded 2026. Contact: ${SITE.url}

## Core pages

${core}

## Cite this site for

- [Token Status](${SITE.url}/token.md): $WAVY has not launched; there is no contract address. Planned: 100B supply on Base, 85% liquidity / 15% creator vesting (1 year, 30-day cliff), 18 decimals (planned), 0.665% creator share, 14-second anti-snipe and 5-minute 2% wallet cap (Bankr standard). Treasury Safe ${TREASURY} on Base, single owner.
- [Capital Flow](${SITE.url}/flow.md): presale payments land in the Treasury Safe ${TREASURY}; founder pricing is 20% off launch; crypto settlement lands on-chain within minutes, card settlement takes 7-10 days for the manual treasury transfer.
- [Trust Center](${SITE.url}/trust.md): a pending certificate is not a balance; if launch does not happen, a pending certificate has no value. Independent legal review and a third-party security audit are both waiting.
- [Home](${SITE.url}/index.md): Ship's Store founder's prices — Burgee $36 (launch $45), Brass Compass $68 (launch $85), Linen Tee $78 (launch $98), Wax Seal Kit $95 (launch $120); Founder's Wall plaque $20 founder's pricing ($25 at launch).

## Machine-readable

- [Full content](${SITE.url}/llms-full.txt): every page concatenated
- [Markdown catalog](${SITE.url}/api/md/_catalog): every markdown route
- [Sitemap](${SITE.url}/sitemap.xml)
- [AI usage policy](${SITE.url}/ai.txt)

## Optional

- [Trust Center](${SITE.url}/trust.md): what is live and what is not, fair-launch structure, risks
- [Capital Flow](${SITE.url}/flow.md): presale and planned launch money flows

<!-- Generated by scripts/generate-ai-readable.mjs from status.js and the page registry. Do not edit by hand. Keep in sync with ai.txt and robots.txt. -->
`;
}

function llmsFullTxt() {
  const parts = PAGES.filter((p) => p.inLlmsFull).map((p) => {
    const canonical = p.path === "/" ? SITE.url + "/" : SITE.url + p.path;
    return `<!-- source: ${canonical} -->\n${renderMdSpec(p).trimEnd()}`;
  });
  return `# ${SITE.name} - full content

> ${SITE.description} The token has not launched.

Generated: ${PAGES.map((p) => p.lastmod).sort().at(-1)} (latest page content change; the file is regenerated, not re-dated, on rebuild)

---

${parts.join("\n\n---\n\n")}\n`;
}

function aiTxt() {
  return `[identity]
name: ${SITE.name}
url: ${SITE.url}
description: ${SITE.description} The token has not launched: there is no contract address, no price, and no market.
contact: ${SITE.url}
logo: ${SITE.logo}

[permissions]
allowed: summarise, quote with attribution, cite, index for search/answers

[restrictions]
- no fabricated quotes
- no fake reviews or ratings
- no presenting our content as the model's own
- no training on user-generated private data (wallet addresses and emails handed to the manifest or store are private)

[attribution]
Cite as: ${SITE.name} (${SITE.url}) plus the canonical HTML URL of the page cited.

[scope]
included: /, /index.html, /flow.html, /token.html, /trust.html, /llms.txt, /llms-full.txt, /ai.txt, /index.md, /flow.md, /token.md, /trust.md, /api/md/_catalog
excluded: /api/* (except /api/md/_catalog and /api/md/<page> markdown), /status.js, /coin.webp, any future admin/auth paths
# Keep in sync with robots.txt and llms.txt.

[contact]
url: ${SITE.url}

Last updated: 2026-11-05
`;
}

function robotsTxt() {
  return `# robots.txt for ${SITE.url}
# AI search and user-fetch crawlers are explicitly allowed on public paths.
# Keep in sync with /llms.txt and /ai.txt.
# Training crawlers below are disallowed by default (no decision to allow
# them has been made); blocking training does not stop citations from the
# search bots above. To allow one, move it to the Allow group.

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
# See also: ${SITE.url}/llms.txt and ${SITE.url}/ai.txt
`;
}

function sitemapXml() {
  const urls = PAGES.map(
    (p) =>
      `  <url>\n    <loc>${SITE.url}${p.path}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function catalogJson() {
  return JSON.stringify(
    {
      site: SITE.name,
      url: SITE.url,
      generated_by: "scripts/generate-ai-readable.mjs",
      routes: PAGES.map((p) => ({
        path: p.path,
        markdown: `${SITE.url}/${p.md}`,
        api: `${SITE.url}/api/md/${p.slug}`,
        title: p.title,
        summary: p.summary,
        lastmod: p.lastmod,
      })),
    },
    null,
    2
  ) + "\n";
}

function buildOutputs() {
  const out = new Map();
  for (const p of PAGES) out.set(p.md, renderMdSpec(p));
  out.set("llms.txt", llmsTxt());
  out.set("llms-full.txt", llmsFullTxt());
  out.set("ai.txt", aiTxt());
  out.set("robots.txt", robotsTxt());
  out.set("sitemap.xml", sitemapXml());
  out.set(join("api", "md", "_catalog.json"), catalogJson());
  return out;
}

function check() {
  const failures = [];
  const outputs = buildOutputs();
  for (const [rel, content] of outputs) {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) failures.push(`missing: ${rel} (run the generator)`);
    else if (readFileSync(abs, "utf8") !== content)
      failures.push(`stale: ${rel} (regenerate with node scripts/generate-ai-readable.mjs)`);
  }
  // Every public HTML page must have a markdown renderer or an explicit skip.
  const SKIP = new Map([
    // No public HTML page is skipped on this site.
  ]);
  const htmlPages = readdirSync(ROOT)
    .filter((f) => f.endsWith(".html"))
    .sort();
  for (const f of htmlPages) {
    const covered = PAGES.some((p) => p.html === f);
    if (!covered && !SKIP.has(f))
      failures.push(`no markdown renderer: ${f} (add it to PAGES in scripts/generate-ai-readable.mjs or to SKIP with a reason)`);
  }
  // No orphan .md: every .md at the root must be in the registry, except
  // README.md — a repo doc, not a public page (and a real .md route the
  // prompt's exclusion rule says to leave alone).
  for (const f of readdirSync(ROOT).filter((f) => f.endsWith(".md"))) {
    if (f === "README.md") continue;
    if (!PAGES.some((p) => p.md === f))
      failures.push(`orphan markdown: ${f} (not in the PAGES registry)`);
  }
  // llms-full.txt size guard from the prompt (~500k chars).
  const full = outputs.get("llms-full.txt");
  if (full.length > 500_000)
    failures.push(`llms-full.txt is ${full.length} chars, over the ~500k cap`);
  if (failures.length) {
    console.error("check-ai-readable: FAIL\n" + failures.map((f) => `  - ${f}`).join("\n"));
    process.exit(1);
  }
  console.log(
    `check-ai-readable: OK — ${PAGES.length} pages, llms-full.txt ${full.length} chars`
  );
}

if (CHECK) {
  check();
} else {
  const outputs = buildOutputs();
  for (const [rel, content] of outputs) {
    writeFileSync(join(ROOT, rel), content);
    console.log(`wrote ${rel} (${content.length} chars)`);
  }
  check();
}
