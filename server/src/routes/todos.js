const router  = require("express").Router();
const prisma   = require("../prisma");
const { resolveClient } = require("../middleware");

router.use(resolveClient);

// GET /todos
router.get("/", async (req, res) => {
  const todos = await prisma.todo.findMany({
    where:   { clientId: req.client.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(todos);
});

// POST /todos
router.post("/", async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: "text is required" });
  }
  const todo = await prisma.todo.create({
    data: { text: text.trim(), clientId: req.client.id },
  });
  res.status(201).json(todo);
});

// PATCH /todos/:id  — toggle done
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.todo.findFirst({
    where: { id, clientId: req.client.id },
  });
  if (!existing) return res.status(404).json({ error: "Todo not found" });

  const todo = await prisma.todo.update({
    where: { id },
    data:  { done: !existing.done },
  });
  res.json(todo);
});

// DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.todo.findFirst({
    where: { id, clientId: req.client.id },
  });
  if (!existing) return res.status(404).json({ error: "Todo not found" });

  await prisma.todo.delete({ where: { id } });
  res.json({ message: "Deleted" });
});

module.exports = router;
