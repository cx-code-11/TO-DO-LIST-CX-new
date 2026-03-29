const prisma = require("./prisma");

async function resolveClient(req, res, next) {
  const subdomain = req.headers["x-subdomain"] || req.query.subdomain;
  if (!subdomain) {
    return res.status(400).json({ error: "Missing X-Subdomain header" });
  }
  const client = await prisma.client.findUnique({ where: { subdomain } });
  if (!client) {
    return res.status(404).json({ error: `Client '${subdomain}' not found` });
  }
  req.client = client;
  next();
}

function adminOnly(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

module.exports = { resolveClient, adminOnly };
