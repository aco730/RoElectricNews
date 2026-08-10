const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:4321/portofoliu/p1", { waitUntil: "networkidle" });
  // click the last thumbnail (our test photo, appended at the end)
  const triggers = await page.$$(".lightbox-trigger");
  await triggers[triggers.length - 1].click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "C:\\Users\\730\\AppData\\Local\\Temp\\claude\\c--Users-730-Desktop-sep\\7045ecb2-9a7a-4196-99a0-6e03e1a92007\\scratchpad\\lightbox.png" });
  await browser.close();
})();
