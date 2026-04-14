import { PrismaClient } from "@/app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import ConsolesTable from "./ConsolesTable";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  }),
});

export default async function ConsolesInfo() {
  const consoles = await prisma.console.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const serializableConsoles = consoles.map((c) => ({
    ...c,
    releaseDate: c.releaseDate.toISOString(),
  }));

  return (
    <div className="w-full">
      <h1 className="text-6xl font-black text-neon-green uppercase tracking-tighter mb-12 glow-text italic">
        Hardware Archive
      </h1>
      <ConsolesTable initialConsoles={serializableConsoles as any} />
    </div>
  );
}
