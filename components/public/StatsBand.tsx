import type { Stat } from "@prisma/client";
import CountUp from "@/components/motion/CountUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export default function StatsBand({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section
      aria-label="Highlights"
      className="bg-foreground text-background"
      style={{ "--cols": Math.min(stats.length, 4) } as React.CSSProperties}
    >
      <StaggerGroup className="mx-auto grid max-w-6xl grid-cols-2 gap-y-14 px-6 py-20 md:py-28 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]">
        {stats.map((stat) => (
          <StaggerItem key={stat.id} className="border-l border-background/20 pl-6">
            <p className="font-display text-stat text-background">
              <CountUp value={stat.value} />
            </p>
            <p className="mt-4 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-background/60">
              {stat.label}
            </p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
