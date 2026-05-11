import { spawn } from "node:child_process";

const routes = ["/dashboard/classes", "/dashboard", "/dashboard/students", "/dashboard/fees", "/dashboard/settings"];
const mustContain = ["Shiksha ERP", "Dashboard", "Students", "Fees &amp; Billing", "Settings"];
const gibberishPattern = /[�]{1,}|[◊□∆]{2,}/;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const server = spawn("npm", ["run", "start", "--", "-p", "4010"], { stdio: "pipe" });
  let ready = false;
  server.stdout.on("data", (d) => { if (d.toString().includes("Ready")) ready = true; process.stdout.write(d); });
  server.stderr.on("data", (d) => process.stderr.write(d));

  for (let i = 0; i < 60 && !ready; i++) await wait(500);
  if (!ready) throw new Error("Server did not start in time");

  const allBodies = [];
  for (const route of routes) {
    const res = await fetch(`http://127.0.0.1:4010${route}`);
    if (!res.ok) throw new Error(`Route ${route} returned ${res.status}`);
    const text = await res.text();
    allBodies.push(text);
  }

  const joined = allBodies.join("\n");
  for (const needle of mustContain) {
    if (!joined.includes(needle)) throw new Error(`Missing expected text: ${needle}`);
  }
  if (gibberishPattern.test(joined)) throw new Error("Potential gibberish symbols found in rendered HTML");

  server.kill("SIGTERM");
  console.log("Route smoke-check passed");
}

run().catch((err) => { console.error(err.message); process.exit(1); });
