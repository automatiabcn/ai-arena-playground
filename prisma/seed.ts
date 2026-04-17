import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AI Arena Playground...");

  // Default settings
  const defaults = [
    { key: "theme", value: "dark" },
    { key: "defaultPanelCount", value: "2" },
    { key: "defaultSystemPrompt", value: "" },
  ];

  for (const d of defaults) {
    await prisma.setting.upsert({
      where: { key: d.key },
      update: {},
      create: d,
    });
  }

  console.log("Seed complete! Run 'npm run dev' to start.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
