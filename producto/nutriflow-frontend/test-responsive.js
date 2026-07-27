// test-responsive.js — Script de diagnóstico responsive con Playwright
// Ejecutar: node test-responsive.js
// Requiere: npx playwright install chromium

import { chromium } from 'playwright';

// ─── Configuración ───
const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'Desktop 1920x1080', width: 1920, height: 1080 },
  { name: 'iPad 768x1024',     width: 768,  height: 1024 },
  { name: 'iPhone 375x667',    width: 375,  height: 667  },
];

// Rutas a auditar
const ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/dashboard',
  '/pacientes',
  '/macronutrientes',
  '/porciones',
  '/pautas',
  '/generador',
  '/biblioteca',
  '/alimentos',
  '/perfil',
];

// ─── Función de detección inyectada en el navegador ───
function detectResponsiveIssues(viewportWidth) {
  const issues = [];

  // 1. Overflow horizontal en <html> y <body>
  const html = document.documentElement;
  const body = document.body;
  if (html.scrollWidth > html.clientWidth) {
    issues.push({
      type: 'DOCUMENT_OVERFLOW',
      severity: 'CRITICAL',
      element: '<html>',
      scrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
      overflow: html.scrollWidth - html.clientWidth,
    });
  }
  if (body.scrollWidth > body.clientWidth) {
    issues.push({
      type: 'BODY_OVERFLOW',
      severity: 'CRITICAL',
      element: '<body>',
      scrollWidth: body.scrollWidth,
      clientWidth: body.clientWidth,
      overflow: body.scrollWidth - body.clientWidth,
    });
  }

  // 2. Todos los elementos del DOM
  const allElements = document.querySelectorAll('*');
  const seen = new Set();

  for (const el of allElements) {
    if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE', 'BR', 'HR'].includes(el.tagName)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const computed = window.getComputedStyle(el);
    const identifier = el.tagName.toLowerCase() +
      (el.id ? `#${el.id}` : '') +
      (el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/).slice(0, 3).join('.') : '');

    // 2a. Overflow horizontal del elemento
    if (el.scrollWidth > el.clientWidth + 2 && computed.overflowX !== 'auto' && computed.overflowX !== 'scroll' && computed.overflowX !== 'hidden') {
      const key = `overflow:${identifier}`;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push({
          type: 'ELEMENT_OVERFLOW',
          severity: 'HIGH',
          element: identifier,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          overflow: el.scrollWidth - el.clientWidth,
          classes: typeof el.className === 'string' ? el.className.trim().substring(0, 200) : '',
          html: el.outerHTML.substring(0, 150),
        });
      }
    }

    // 2b. Ancho fijo que excede viewport
    const widthStyle = computed.width;
    if (widthStyle && widthStyle.endsWith('px')) {
      const widthPx = parseFloat(widthStyle);
      if (widthPx > viewportWidth && computed.position !== 'fixed' && computed.position !== 'absolute') {
        const key = `fixedw:${identifier}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push({
            type: 'FIXED_WIDTH_EXCEEDS_VIEWPORT',
            severity: 'HIGH',
            element: identifier,
            computedWidth: widthPx,
            viewportWidth: viewportWidth,
            excess: Math.round(widthPx - viewportWidth),
            classes: typeof el.className === 'string' ? el.className.trim().substring(0, 200) : '',
          });
        }
      }
    }

    // 2c. Elemento se extiende fuera del viewport (derecha)
    if (rect.right > viewportWidth + 5 && computed.position !== 'fixed' && computed.position !== 'absolute' && computed.display !== 'none') {
      const key = `outofbounds:${identifier}`;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push({
          type: 'ELEMENT_OUTSIDE_VIEWPORT',
          severity: 'MEDIUM',
          element: identifier,
          rightEdge: Math.round(rect.right),
          viewportWidth: viewportWidth,
          excess: Math.round(rect.right - viewportWidth),
          classes: typeof el.className === 'string' ? el.className.trim().substring(0, 200) : '',
        });
      }
    }

    // 2d. Botones o links con touch-target muy pequeño (< 44px) — solo en viewports < 768
    if (viewportWidth < 768) {
      const isInteractive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) ||
        el.getAttribute('role') === 'button' ||
        el.getAttribute('tabindex') !== null;
      if (isInteractive && (rect.width > 0 && rect.height > 0) && (rect.width < 44 || rect.height < 44) && computed.display !== 'none' && rect.width > 1) {
        const key = `touch:${identifier}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push({
            type: 'SMALL_TOUCH_TARGET',
            severity: 'LOW',
            element: identifier,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            minRecommended: 44,
            classes: typeof el.className === 'string' ? el.className.trim().substring(0, 200) : '',
          });
        }
      }
    }
  }

  return issues;
}

// ─── Runner principal ───
async function main() {
  console.log('\\n🔍 NutriFlow — Diagnóstico Responsive');
  console.log('═'.repeat(60));

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const allResults = {};
  let totalIssues = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\\n📱 Viewport: ${vp.name}`);
    console.log('─'.repeat(50));

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.width <= 768 ? 2 : 1,
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 8000 });
      } catch {
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
        } catch {
          console.log(`  ⚠ ${route} — no se pudo cargar, saltando`);
          continue;
        }
      }

      // Esperar un momento para que React renderice
      await page.waitForTimeout(1000);

      // Inyectar y ejecutar detector
      const issues = await page.evaluate(detectResponsiveIssues, vp.width);

      const key = `${vp.name} → ${route}`;
      if (issues.length > 0) {
        allResults[key] = issues;
        totalIssues += issues.length;

        const critical = issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
        if (critical.length > 0) {
          console.log(`  ❌ ${route} — ${issues.length} problemas (${critical.length} críticos/altos)`);
          for (const issue of critical) {
            console.log(`     ├─ [${issue.severity}] ${issue.type}: ${issue.element}`);
            if (issue.overflow) console.log(`     │  overflow: ${issue.overflow}px`);
            if (issue.excess) console.log(`     │  exceso: ${issue.excess}px`);
            if (issue.classes) console.log(`     │  clases: ${issue.classes.substring(0, 100)}`);
          }
        } else {
          console.log(`  ⚠ ${route} — ${issues.length} problemas menores`);
        }
      } else {
        console.log(`  ✅ ${route} — sin problemas`);
      }
    }

    await context.close();
  }

  console.log('\\n' + '═'.repeat(60));
  console.log(`📊 RESUMEN: ${totalIssues} problemas encontrados en total`);

  // Guardar reporte JSON completo
  const fs = await import('fs');
  const reportPath = './responsive-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
  console.log(`📄 Reporte completo guardado en: ${reportPath}`);

  await browser.close();
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
