const express = require("express");
const app = express();

app.use(express.json());

const USER_SERVICE_URL     = process.env.USER_SERVICE_URL     || "http://user_service:4001";
const TRACKING_SERVICE_URL = process.env.TRACKING_SERVICE_URL || "http://tracking_service:4003";

app.get("/", (_, res) => res.json({ service: "gateway" }));

app.get("/health", (_, res) => res.json({ ok: true, service: "gateway" }));

// Proxy helpers
async function proxyRequest(req, res, targetUrl) {
  const fetchRes = await fetch(targetUrl, {
    method: req.method,
    headers: { "Content-Type": "application/json" },
    body: ["GET", "DELETE"].includes(req.method) ? undefined : JSON.stringify(req.body),
  });
  const data = await fetchRes.json();
  res.status(fetchRes.status).json(data);
}

// Users
app.use("/users", async (req, res) => {
  const url = `${USER_SERVICE_URL}${req.originalUrl}`;
  await proxyRequest(req, res, url);
});

// Tracked meals
app.use("/tracked-meals", async (req, res) => {
  const url = `${TRACKING_SERVICE_URL}${req.originalUrl}`;
  await proxyRequest(req, res, url);
});

app.listen(3000, () => console.log("gateway on 3000"));
