import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  // Collect console messages from the page
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE ERROR] ${err.message}`));
  
  await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 60000 });
  
  // Wait a bit for any client-side rendering
  await page.waitForTimeout(3000);
  
  // Console logs
  console.log('=== CONSOLE LOGS ===');
  for (const log of consoleLogs) {
    console.log(log);
  }
  
  // =============================================
  // 1. Root fixed grid layout
  // =============================================
  const rootInfo = await page.evaluate(() => {
    const root = document.querySelector('[style*="position: fixed"]');
    if (!root) return { error: 'No fixed root found' };
    const rect = root.getBoundingClientRect();
    const style = window.getComputedStyle(root);
    const children = Array.from(root.children).map((child, i) => {
      const r = child.getBoundingClientRect();
      return {
        index: i,
        tag: child.tagName,
        classes: child.className,
        rect: { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom },
      };
    });
    return {
      rootRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      gridTemplateColumns: style.gridTemplateColumns,
      childCount: root.children.length,
      children,
    };
  });
  console.log('=== ROOT GRID LAYOUT ===');
  console.log(JSON.stringify(rootInfo, null, 2));

  // =============================================
  // 2. Full element tree with bounding boxes
  // =============================================
  const layoutTree = await page.evaluate(() => {
    const results = [];
    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      if (div.children.length === 0) continue; // skip leaf divs, too noisy
      const rect = div.getBoundingClientRect();
      const style = window.getComputedStyle(div);
      results.push({
        classes: div.className.substring(0, 120),
        rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height), bottom: Math.round(rect.bottom) },
        display: style.display,
        position: style.position,
        overflow: style.overflow,
        flex: style.flex,
        childCount: div.children.length,
        id: div.id || '',
      });
    }
    return results;
  });
  
  console.log('=== ALL DIV LAYOUT (non-leaf) ===');
  for (const d of layoutTree) {
    console.log(`${d.id ? '#'+d.id+' ' : ''}class="${d.classes.substring(0, 80)}" rect=[${d.rect.top},${d.rect.left},${d.rect.width}x${d.rect.height}] display=${d.display} pos=${d.position} flex=${d.flex} children=${d.childCount}`);
  }

  // =============================================
  // 3. Find ChatInput specifically by looking at bottom elements
  // =============================================
  const bottomInfo = await page.evaluate(() => {
    // Find divs whose bottom edge is near the viewport bottom
    const vh = window.innerHeight;
    const allDivs = document.querySelectorAll('div');
    const nearBottom = [];
    for (const div of allDivs) {
      const rect = div.getBoundingClientRect();
      if (rect.bottom >= vh - 10 && rect.top < vh && rect.width > 50) {
        const style = window.getComputedStyle(div);
        nearBottom.push({
          classes: div.className.substring(0, 100),
          rect: { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height), bottom: Math.round(rect.bottom) },
          overflow: style.overflow,
          flex: style.flex,
          borderTop: style.borderTop,
          childCount: div.children.length,
        });
      }
    }
    return { viewportHeight: vh, nearBottom };
  });
  console.log('=== BOTTOM-EDGE DIVS (near viewport bottom) ===');
  console.log(JSON.stringify(bottomInfo, null, 2));

  // =============================================
  // 4. Screenshot
  // =============================================
  await page.screenshot({ path: 'debug-layout.png', fullPage: true });
  
  // =============================================
  // 5. Check full page scroll height
  // =============================================
  const scrollInfo = await page.evaluate(() => ({
    scrollHeight: document.body.scrollHeight,
    scrollWidth: document.body.scrollWidth,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  }));
  console.log('=== SCROLL INFO ===');
  console.log(JSON.stringify(scrollInfo, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
