const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const clients = [
    { name: "Acme Corp",  subdomain: "acme"   },
    { name: "Globex Inc", subdomain: "globex" },
  ];

  for (const c of clients) {
    await prisma.client.upsert({
      where:  { subdomain: c.subdomain },
      update: {},
      create: c,
    });
  }
  console.log("Seeded clients.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
