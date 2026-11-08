// Mic Drop and online checks. Needs Chrome and puppeteer-core.
//   node tests/fight-regress.mjs
// Online pairing is optional: set HHU_ONLINE=1 to open two clients
// against the real Supabase project. That part is not a mock.
import puppeteer from "puppeteer-core";

const chrome = process.env.CHROME || "/usr/bin/google-chrome";
const base = process.env.HHU_URL || "http://127.0.0.1:8765/index.html?gfx=low&v=home";
const args = ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--disable-dev-shm-usage", "--disable-background-timer-throttling"];

const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args });
const page = await browser.newPage();
await page.goto(base, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => window.__hhu3d && window.__sfPick && window.__hhu3d.quick);
await page.evaluate(() => window.__hhu3d.quick(0, 1, {}));
await page.waitForFunction(() => window.__hhu3d.state().scene === "fight");
await page.evaluate(() => { window.__hhu3d.pause(true); window.__hhu3d.setCPU(false); window.__hhu3d.step(15); });

const shots = await page.evaluate(() => {
  const H = window.__hhu3d;
  const rows = [];
  for (const d of H.ROSTER) {
    const a = H.F()[0], b = H.F()[1];
    a.d = d; a.st = "idle"; a.mv = null; a.mode = 0; a.meter = 300; a.x = 400; a.y = 520; a.face = 1; a.t = 0;
    b.st = "idle"; b.mv = null; b.hp = b.maxhp; b.x = 640; b.y = 520; b.face = -1;
    const before = b.hp;
    let called = null;
    const prev = window.__hhuSuper;
    window.__hhuSuper = function (f) { called = f && f.d && f.d.id; return prev && prev(f); };
    H.doMove(0, "sp");
    window.__hhuSuper = prev;
    let min = b.hp, special = false, idle = false;
    for (let t = 0; t < 90; t++) {
      H.step(1);
      const L = window.__hhuMicLock;
      if (L && L.kind === "special") special = true;
      min = Math.min(min, H.F()[1].hp);
      if (!window.__hhuMicLock && H.F()[0].st === "idle") idle = true;
    }
    rows.push({ id: d.id, called, drop: Math.round(before - min), special, idle, mode: H.F()[0].mode || 0 });
  }
  const a = H.F()[0];
  a.meter = 200; a.mode = 0; a.st = "idle";
  return { rows, low: window.__sfPick(a, "sp", { p_sp: 1 }), full: window.__sfPick(Object.assign(a, { meter: 300 }), "sp", { p_sp: 1, p_lp: 1 }) };
});

const bad = shots.rows.filter(r => r.called !== r.id || r.drop < 40 || !r.special || !r.idle || r.mode);
if (bad.length || shots.low || shots.full !== "sp") {
  console.error(JSON.stringify({ bad, low: shots.low, full: shots.full }, null, 2));
  process.exitCode = 1;
} else {
  console.log("mic drop ok", shots.rows.length, "fighters");
}

if (process.env.HHU_ONLINE === "1") {
  const hostB = await puppeteer.launch({ executablePath: chrome, headless: "new", args });
  const guestB = await puppeteer.launch({ executablePath: chrome, headless: "new", args });
  const host = await hostB.newPage();
  const guest = await guestB.newPage();
  await host.goto(base, { waitUntil: "domcontentloaded" });
  await host.waitForFunction(() => window.__hhuOnline);
  await host.evaluate(() => window.__hhuOnline.createRoom());
  await host.waitForFunction(() => window.__hhuOnline.net.code, { timeout: 15000 });
  const code = await host.evaluate(() => window.__hhuOnline.net.code);
  await guest.goto(base + "&room=" + code, { waitUntil: "domcontentloaded" });
  await Promise.all([
    host.waitForFunction(() => window.__hhuOnline.net.peerReady, { timeout: 15000 }),
    guest.waitForFunction(() => window.__hhuOnline.net.peerReady, { timeout: 15000 })
  ]);
  await host.evaluate(() => { window.__hhuOnline.net.myPick = 1; document.getElementById("onlock").click(); });
  await guest.evaluate(() => { window.__hhuOnline.net.myPick = 2; document.getElementById("onlock").click(); });
  await Promise.all([
    host.waitForFunction(() => window.__hhu3d.state().scene === "fight", { timeout: 20000 }),
    guest.waitForFunction(() => window.__hhu3d.state().scene === "fight", { timeout: 20000 })
  ]);
  await new Promise(r => setTimeout(r, 600));
  await host.keyboard.down("KeyD");
  await guest.keyboard.down("ArrowRight");
  await new Promise(r => setTimeout(r, 1200));
  await host.keyboard.up("KeyD");
  await guest.keyboard.up("ArrowRight");
  await new Promise(r => setTimeout(r, 2500));
  const snap = p => p.evaluate(() => window.__hhu3d.state().x);
  const hx = await snap(host), gx = await snap(guest);
  console.log("online", code, hx, gx);
  if (hx[0] === gx[0] && hx[1] === gx[1] && hx[0] > 360) console.log("online positions matched");
  else { console.error("online drift", hx, gx); process.exitCode = 1; }
  await hostB.close();
  await guestB.close();
}
await browser.close();
