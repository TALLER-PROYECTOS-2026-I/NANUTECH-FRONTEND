// browser-security.spec.ts
// Análisis de seguridad browser para NANUTECH FRONTEND.
// Ejecutado por job4-browser.yml via Playwright.
//
// Checks:
//   1. Security headers en la respuesta HTTP
//   2. localStorage con datos sensibles (nanutech_token, etc.)
//   3. sessionStorage con datos sensibles
//   4. Cookies: HttpOnly, Secure, SameSite
//   5. Archivos .env expuestos públicamente
//   6. Variables VITE_ en bundles JS compilados

import { test, chromium, type BrowserContext, type Response } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const TARGET_URL =
  process.env.TARGET_URL || "https://testing.dcoqassfbrwx2.amplifyapp.com";
const REPORT_DIR  = "security-reports/browser";
const REPORT_PATH = path.join(REPORT_DIR, "browser-analysis.json");

// Claves conocidas de NANUTECH que contienen datos sensibles
const NANUTECH_SENSITIVE_KEYS = [
  "nanutech_token",
  "nanutech_id_token",
  "nanutech_user",
  "nanutech_role",
  "nanutech_expires_at",
];

// Palabras clave genéricas para detectar storage sensible
const SENSITIVE_KEYWORDS = [
  "token", "auth", "jwt", "access", "refresh",
  "secret", "password", "passwd", "credential", "api_key",
];

const isSensitive = (key: string) =>
  NANUTECH_SENSITIVE_KEYS.includes(key) ||
  SENSITIVE_KEYWORDS.some((k) => key.toLowerCase().includes(k));

interface Finding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  category: string;
  message: string;
  detail?: string;
}

interface Report {
  url: string;
  timestamp: string;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: object[];
  headers: Record<string, string>;
  securityFindings: Finding[];
  envExposed: boolean;
  score: number;
}

const report: Report = {
  url: TARGET_URL,
  timestamp: new Date().toISOString(),
  localStorage: {},
  sessionStorage: {},
  cookies: [],
  headers: {},
  securityFindings: [],
  envExposed: false,
  score: 100,
};

function addFinding(f: Finding) {
  report.securityFindings.push(f);
}

// ── Setup / Teardown ────────────────────────────────────────────────────

let sharedContext: BrowserContext;

test.beforeAll(async () => {
  const browser = await chromium.launch({ headless: true });
  sharedContext  = await browser.newContext({
    ignoreHTTPSErrors: false,
    userAgent: "Mozilla/5.0 (SecurityAudit/1.0) Playwright",
  });
});

test.afterAll(async () => {
  const criticals = report.securityFindings.filter((f) => f.severity === "CRITICAL").length;
  const highs     = report.securityFindings.filter((f) => f.severity === "HIGH").length;
  const mediums   = report.securityFindings.filter((f) => f.severity === "MEDIUM").length;
  report.score    = Math.max(0, 100 - criticals * 25 - highs * 15 - mediums * 5);

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("BROWSER SECURITY ANALYSIS — NANUTECH");
  console.log("=".repeat(60));
  console.log(`URL:   ${report.url}`);
  console.log(`Score: ${report.score}/100`);
  console.log(`\nHallazgos (${report.securityFindings.length}):`);
  for (const f of report.securityFindings) {
    const icon = f.severity === "CRITICAL" ? "🔴" : f.severity === "HIGH" ? "🟠" : "🟡";
    console.log(`  ${icon} [${f.severity}] ${f.category}: ${f.message}`);
  }

  await sharedContext.close();
});

// ── CHECK 1: Security Headers ───────────────────────────────────────────

test("CHECK 1 — Security Headers HTTP", async () => {
  const page     = await sharedContext.newPage();
  const response = await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  if (!response) throw new Error("No se pudo cargar la página");

  const headers = response.headers();
  report.headers = headers;

  const checks: Array<{ key: string; sev: Finding["severity"]; msg: string; detail: string }> = [
    { key: "content-security-policy", sev: "HIGH",   msg: "Falta Content-Security-Policy (CSP)",          detail: "Sin CSP el navegador no previene XSS ni inyección de scripts." },
    { key: "strict-transport-security", sev: "HIGH", msg: "Falta Strict-Transport-Security (HSTS)",       detail: "Vulnerable a downgrade HTTPS→HTTP." },
    { key: "x-frame-options",          sev: "MEDIUM", msg: "Falta X-Frame-Options",                       detail: "El sitio puede ser embebido en un iframe (Clickjacking)." },
    { key: "x-content-type-options",   sev: "MEDIUM", msg: "Falta X-Content-Type-Options: nosniff",       detail: "Permite MIME type sniffing." },
    { key: "referrer-policy",          sev: "LOW",    msg: "Falta Referrer-Policy",                       detail: "Sin control sobre datos enviados en el header Referer." },
    { key: "permissions-policy",       sev: "LOW",    msg: "Falta Permissions-Policy",                    detail: "No restringe acceso a APIs del navegador." },
  ];

  for (const c of checks) {
    if (!headers[c.key]) {
      addFinding({ severity: c.sev, category: "Headers", message: c.msg, detail: c.detail });
    }
  }

  // CSP presente pero con directivas peligrosas
  const csp = headers["content-security-policy"] || "";
  if (csp.includes("'unsafe-eval'")) {
    addFinding({ severity: "HIGH",   category: "Headers", message: "CSP contiene 'unsafe-eval'",   detail: csp });
  }
  if (csp.includes("'unsafe-inline'")) {
    addFinding({ severity: "MEDIUM", category: "Headers", message: "CSP contiene 'unsafe-inline'", detail: csp });
  }

  // Server header (info disclosure)
  const server = headers["server"];
  if (server) {
    addFinding({ severity: "LOW", category: "Headers", message: `Header 'Server' expone tecnología: ${server}` });
  }

  await page.close();
});

// ── CHECK 2: localStorage ──────────────────────────────────────────────

test("CHECK 2 — localStorage con datos sensibles", async () => {
  const page = await sharedContext.newPage();
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const storage = await page.evaluate(() => {
    const result: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)!;
      result[key] = window.localStorage.getItem(key) || "";
    }
    return result;
  });

  report.localStorage = storage;

  for (const [key, value] of Object.entries(storage)) {
    if (isSensitive(key)) {
      const isJWT = value.split(".").length === 3 && value.startsWith("ey");
      addFinding({
        severity: isJWT ? "CRITICAL" : "HIGH",
        category: "localStorage",
        message:  `${isJWT ? "Token JWT" : "Dato sensible"} en localStorage: '${key}'`,
        detail:   "localStorage es accesible por cualquier JS en la página → vulnerable a XSS. Usar cookies HttpOnly.",
      });
    }
  }

  console.log(`\nlocalStorage: ${Object.keys(storage).join(", ") || "(vacío)"}`);
  await page.close();
});

// ── CHECK 3: sessionStorage ────────────────────────────────────────────

test("CHECK 3 — sessionStorage con datos sensibles", async () => {
  const page = await sharedContext.newPage();
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const storage = await page.evaluate(() => {
    const result: Record<string, string> = {};
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i)!;
      result[key] = window.sessionStorage.getItem(key) || "";
    }
    return result;
  });

  report.sessionStorage = storage;

  for (const [key] of Object.entries(storage)) {
    if (isSensitive(key)) {
      addFinding({
        severity: "HIGH",
        category: "sessionStorage",
        message:  `Dato sensible en sessionStorage: '${key}'`,
        detail:   "sessionStorage es accesible por JS. Usar cookies HttpOnly.",
      });
    }
  }

  console.log(`\nsessionStorage: ${Object.keys(storage).join(", ") || "(vacío)"}`);
  await page.close();
});

// ── CHECK 4: Cookies ───────────────────────────────────────────────────

test("CHECK 4 — Flags de cookies (HttpOnly, Secure, SameSite)", async () => {
  const page = await sharedContext.newPage();
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  const cookies = await sharedContext.cookies(TARGET_URL);
  report.cookies = cookies.map((c) => ({
    name:     c.name,
    httpOnly: c.httpOnly,
    secure:   c.secure,
    sameSite: c.sameSite,
    domain:   c.domain,
    path:     c.path,
  }));

  for (const c of cookies) {
    if (!isSensitive(c.name)) continue;

    if (!c.httpOnly) {
      addFinding({
        severity: "CRITICAL",
        category: "Cookies",
        message:  `Cookie sensible '${c.name}' sin flag HttpOnly`,
        detail:   "Accesible desde JavaScript → vulnerable a XSS.",
      });
    }
    if (!c.secure) {
      addFinding({
        severity: "HIGH",
        category: "Cookies",
        message:  `Cookie sensible '${c.name}' sin flag Secure`,
        detail:   "Puede transmitirse por HTTP no cifrado.",
      });
    }
    if (!c.sameSite || c.sameSite === "None") {
      addFinding({
        severity: "MEDIUM",
        category: "Cookies",
        message:  `Cookie '${c.name}' sin SameSite restrictivo`,
        detail:   "Vulnerable a CSRF.",
      });
    }
  }

  console.log(`\nCookies (${cookies.length}):`);
  for (const c of cookies) {
    console.log(`  ${c.name}: HttpOnly=${c.httpOnly} Secure=${c.secure} SameSite=${c.sameSite}`);
  }
  await page.close();
});

// ── CHECK 5: Archivos sensibles expuestos ──────────────────────────────

test("CHECK 5 — Archivos .env y config expuestos", async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext();
  const page    = await ctx.newPage();

  const files = [
    ".env", ".env.local", ".env.production",
    ".env.development", ".env.example",
    "config.js", ".git/config",
  ];

  for (const file of files) {
    try {
      const url      = `${TARGET_URL}/${file}`;
      const response = await page.goto(url, { timeout: 8000 });

      if (response && response.status() === 200) {
        const content = await response.text();
        // Verificar que es realmente un .env y no el SPA servido por React Router
        const isRealEnv =
          content.includes("VITE_") ||
          content.includes("REACT_APP_") ||
          (content.includes("=") && !content.includes("<html") && !content.includes("<!DOCTYPE"));

        if (isRealEnv) {
          report.envExposed = true;
          addFinding({
            severity: "CRITICAL",
            category: "File Exposure",
            message:  `${file} accesible públicamente`,
            detail:   `URL: ${url}\n${content.substring(0, 300)}`,
          });
          console.log(`🚨 CRÍTICO: ${file} expuesto`);
        } else {
          console.log(`  ✅ ${file}: HTTP 200 pero es el SPA (React Router)`);
        }
      } else {
        console.log(`  ✅ ${file}: HTTP ${response?.status() || "error"}`);
      }
    } catch {
      console.log(`  ✅ ${file}: no accesible`);
    }
  }

  await ctx.close();
  await browser.close();
});

// ── CHECK 6: Variables VITE_ en bundles JS ────────────────────────────

test("CHECK 6 — Variables sensibles en bundle JS compilado", async () => {
  const page    = await sharedContext.newPage();
  const jsUrls: string[] = [];

  page.on("response", (r: Response) => {
    const url = r.url();
    if (url.endsWith(".js") && !url.includes("node_modules")) jsUrls.push(url);
  });

  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });

  let checkedCount = 0;
  for (const jsUrl of jsUrls.slice(0, 5)) {
    try {
      const res = await page.goto(jsUrl, { timeout: 10000 });
      if (!res) continue;
      const content = await res.text();
      checkedCount++;

      // Detectar si hay secrets reales (no solo URLs públicas conocidas)
      const secretPatterns = [
        /["']?(?:password|secret|private_key)["']?\s*[:=]\s*["']([^"']{8,})["']/i,
        /AWS_SECRET_ACCESS_KEY\s*=\s*["']([^"']+)["']/,
        /cognito.*?["']([a-z0-9]{26})["']/i,
      ];

      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          addFinding({
            severity: "HIGH",
            category: "Bundle Exposure",
            message:  `Posible secreto en bundle: ${jsUrl.split("/").pop()}`,
            detail:   `Patrón detectado: ${pattern.source.substring(0, 60)}`,
          });
        }
      }
    } catch {
      // Ignorar bundles individuales que no carguen
    }
  }

  console.log(`\nBundles JS analizados: ${checkedCount}`);
  await page.close();
});
