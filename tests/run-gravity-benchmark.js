const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PORT = 8787;
const SETTLE_MS = 2000;
const SAMPLE_MS = 5000;
const SAMPLE_INTERVAL_MS = 400;

/*
 * Canvas profiles. The game sizes its canvas from the viewport dimensions
 * (document.documentElement.clientWidth/Height), so Playwright viewport
 * directly controls canvas size. DPR affects the onscreen rendering canvas.
 *
 * Pass --profile=<name> to select. Default is "desktop".
 */
const PROFILES = {
  desktop:    { width: 800,  height: 600,  dpr: 1, label: "Desktop 800x600 @1x" },
  ipad:       { width: 1024, height: 1366, dpr: 2, label: "iPad Pro 1024x1366 @2x" },
  "ipad-air": { width: 820,  height: 1180, dpr: 2, label: "iPad Air 820x1180 @2x" },
  "4k":       { width: 1920, height: 1080, dpr: 2, label: "4K Desktop 1920x1080 @2x" },
  stress:     { width: 1920, height: 1080, dpr: 1, label: "Stress 1920x1080 @1x" },
};

const REGIMES = [
  { name: "baseline (down)", strategy: "baseline", bucket: 0, strength: 1 },
  { name: "family32 bucket=0 (down)", strategy: "family32", bucket: 0, strength: 1 },
  { name: "family32 bucket=8 (right)", strategy: "family32", bucket: 8, strength: 1 },
  { name: "family32 bucket=12 (up-right)", strategy: "family32", bucket: 12, strength: 1 },
  { name: "family32 bucket=4 (down-right)", strategy: "family32", bucket: 4, strength: 1 },
  { name: "family32 bucket=8 str=0.5", strategy: "family32", bucket: 8, strength: 0.5 },
];

const SCENES = ["sand", "mixed"];

const ROOT = path.resolve(__dirname, "..");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function findPlaywright() {
  try {
    return require("playwright");
  } catch (_) {}

  /* Search the npx cache for a cached playwright install, prefer stable versions */
  const npxCache = path.join(
    process.env.LOCALAPPDATA || path.join(require("os").homedir(), "AppData", "Local"),
    "npm-cache",
    "_npx"
  );
  if (fs.existsSync(npxCache)) {
    const candidates = [];
    for (const dir of fs.readdirSync(npxCache)) {
      const candidate = path.join(npxCache, dir, "node_modules", "playwright");
      if (fs.existsSync(candidate)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(path.join(candidate, "package.json"), "utf8"));
          const isAlpha = (pkg.version || "").includes("alpha");
          candidates.push({ path: candidate, version: pkg.version || "", isAlpha });
        } catch (_) {}
      }
    }
    /* Prefer stable versions over alpha */
    candidates.sort((a, b) => (a.isAlpha === b.isAlpha ? 0 : a.isAlpha ? 1 : -1));
    for (const c of candidates) {
      try {
        return require(c.path);
      } catch (_) {}
    }
  }

  console.error("Cannot find playwright. Run: npx playwright install");
  process.exit(1);
}

async function main() {
  const profileArg = process.argv.find((a) => a.startsWith("--profile="));
  const profileName = profileArg ? profileArg.split("=")[1] : "desktop";
  const profile = PROFILES[profileName];
  if (!profile) {
    console.error("Unknown profile: " + profileName);
    console.error("Available: " + Object.keys(PROFILES).join(", "));
    process.exit(1);
  }

  console.log("Profile: " + profile.label + "\n");

  const server = spawn("python", ["-m", "http.server", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
  });

  await sleep(1500);

  const playwright = findPlaywright();
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: profile.width, height: profile.height },
    deviceScaleFactor: profile.dpr,
  });

  try {
    await page.goto(`http://localhost:${PORT}`, { waitUntil: "load" });
    await page.waitForSelector("#fps-counter", { timeout: 10000 });
    await sleep(1500);

    /* Report actual canvas dimensions */
    const dims = await page.evaluate(() => {
      return { width: width, height: height, pixels: width * height, dpr: window.devicePixelRatio };
    });
    console.log(
      "Canvas: " + dims.width + "x" + dims.height +
      " (" + dims.pixels.toLocaleString() + " pixels), DPR=" + dims.dpr + "\n"
    );

    /* Uncap FPS to measure actual headroom (default cap is 60) */
    await page.evaluate(() => {
      setFPS(120);
    });

    /*
     * Wrap updateGame to collect per-call timing.
     * updateGame is a top-level function declaration, so it's on window in browser scripts.
     */
    await page.evaluate(() => {
      window.__benchFrameTimes = [];
      const _origUpdateGame = updateGame;
      updateGame = function () {
        const t0 = performance.now();
        _origUpdateGame();
        const elapsed = performance.now() - t0;
        window.__benchFrameTimes.push(elapsed);
        /* Keep last 600 samples (~5s at 120fps) */
        if (window.__benchFrameTimes.length > 600)
          window.__benchFrameTimes.splice(0, window.__benchFrameTimes.length - 600);
      };
    });

    const results = [];

    for (const scene of SCENES) {
      await page.evaluate((s) => window.loadBenchmarkScene(s), scene);
      await sleep(500);

      for (const regime of REGIMES) {
        await page.evaluate(
          (r) =>
            window.setTiltBenchmarkState({
              strategy: r.strategy,
              bucket: r.bucket,
              strength: r.strength,
            }),
          regime
        );

        /* Clear timing buffer and let scene settle */
        await page.evaluate(() => { window.__benchFrameTimes.length = 0; });
        await sleep(SETTLE_MS);

        /* Clear again so we only measure steady-state */
        await page.evaluate(() => { window.__benchFrameTimes.length = 0; });

        /* Collect for SAMPLE_MS */
        await sleep(SAMPLE_MS);

        /* Read FPS samples from the counter */
        const fpsText = await page.locator("#fps-counter").innerText();
        const fps = parseInt(fpsText.replace(/[^0-9]/g, ""), 10) || 0;

        /* Read frame-time samples */
        const frameTimes = await page.evaluate(() => {
          return window.__benchFrameTimes.slice();
        });

        let avgMs = 0, minMs = 0, maxMs = 0, p50 = 0, p95 = 0;
        if (frameTimes.length > 0) {
          avgMs = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const sorted = frameTimes.slice().sort((a, b) => a - b);
          minMs = sorted[0];
          maxMs = sorted[sorted.length - 1];
          p50 = sorted[Math.floor(sorted.length * 0.5)];
          p95 = sorted[Math.floor(sorted.length * 0.95)];
        }

        results.push({
          scene,
          regime: regime.name,
          fps,
          frames: frameTimes.length,
          avgMs: avgMs.toFixed(2),
          minMs: minMs.toFixed(2),
          maxMs: maxMs.toFixed(2),
          p50: p50.toFixed(2),
          p95: p95.toFixed(2),
        });
      }
    }

    console.log("\n=== Gravity Regime Frame-Time Benchmark ===\n");
    console.log(
      "Scene".padEnd(8) +
        "Regime".padEnd(35) +
        "FPS".padEnd(6) +
        "Frames".padEnd(8) +
        "Avg ms".padEnd(9) +
        "p50 ms".padEnd(9) +
        "p95 ms".padEnd(9) +
        "Min ms".padEnd(9) +
        "Max ms"
    );
    console.log("-".repeat(100));
    for (const r of results) {
      console.log(
        r.scene.padEnd(8) +
          r.regime.padEnd(35) +
          String(r.fps).padEnd(6) +
          String(r.frames).padEnd(8) +
          r.avgMs.padEnd(9) +
          r.p50.padEnd(9) +
          r.p95.padEnd(9) +
          r.minMs.padEnd(9) +
          r.maxMs
      );
    }
    console.log("");
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
