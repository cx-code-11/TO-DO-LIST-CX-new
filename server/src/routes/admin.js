const router = require("express").Router();
const prisma  = require("../prisma");
const { adminOnly } = require("../middleware");

router.use(adminOnly);

// GET /admin/clients
router.get("/clients", async (_req, res) => {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  res.json(clients);
});

// POST /admin/clients
router.post("/clients", async (req, res) => {
  const { name, subdomain } = req.body;
  if (!name || !subdomain) {
    return res.status(400).json({ error: "name and subdomain are required" });
  }
  const client = await prisma.client.create({
    data: { name, subdomain: subdomain.toLowerCase().trim() },
  });
  res.status(201).json(client);
});

// GET /admin/todos  — all todos across all clients
router.get("/todos", async (_req, res) => {
  const todos = await prisma.todo.findMany({
    include: { client: { select: { name: true, subdomain: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(todos);
});

// GET /admin/todos/:clientId  — todos for one client
router.get("/todos/:clientId", async (req, res) => {
  const todos = await prisma.todo.findMany({
    where:   { clientId: parseInt(req.params.clientId) },
    include: { client: { select: { name: true, subdomain: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(todos);
});

// GET /admin/stats  — summary stats per client
router.get("/stats", async (_req, res) => {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { todos: true } } },
  });

  const stats = await Promise.all(
    clients.map(async (c) => {
      const done = await prisma.todo.count({
        where: { clientId: c.id, done: true },
      });
      return {
        id:        c.id,
        name:      c.name,
        subdomain: c.subdomain,
        total:     c._count.todos,
        done,
        pending:   c._count.todos - done,
      };
    })
  );
  res.json(stats);
});

module.exports = router;
