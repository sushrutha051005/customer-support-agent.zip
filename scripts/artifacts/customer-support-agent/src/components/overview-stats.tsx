import { Clock3, Layers3, MessageCircleMore, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import type { SupportOverview } from '@workspace/api-client-react';

export function OverviewStats({ overview, loading }: { overview?: SupportOverview; loading?: boolean }) {
  const stats = [
    { label: 'Active customers', value: overview?.activeCustomers ?? 0, icon: MessageCircleMore, note: 'in your queue', tone: 'teal' },
    { label: 'Open tickets', value: overview?.openTickets ?? 0, icon: Layers3, note: 'need a next step', tone: 'coral' },
    { label: 'Avg. response time', value: overview?.avgResponseTime ?? '—', icon: Clock3, note: 'this week', tone: 'blue' },
    { label: 'Memories captured', value: overview?.memoriesCaptured ?? 0, icon: Sparkles, note: 'helping future replies', tone: 'gold' },
  ] as const;

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Support health">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const toneClass = stat.tone === 'teal' ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : stat.tone === 'coral' ? 'bg-[hsl(var(--accent)/.15)] text-[hsl(var(--accent-foreground))]' : stat.tone === 'blue' ? 'bg-[hsl(208_46%_52%/.12)] text-[hsl(208_46%_42%)]' : 'bg-[hsl(42_70%_57%/.18)] text-[hsl(38_55%_34%)]';
        return (
          <div key={stat.label} className={`appear rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] ${index ? `appear-delay-${Math.min(index, 3)}` : ''}`} data-testid={`stat-${stat.label.toLowerCase().replaceAll(' ', '-')}`}>
            <div className="flex items-start justify-between">
              <span className={`grid size-9 place-items-center rounded-xl ${toneClass}`}><Icon size={17} /></span>
              {index === 1 ? <TrendingUp size={15} className="text-[hsl(var(--accent-foreground)/.55)]" /> : <TrendingDown size={15} className="text-[hsl(var(--primary)/.55)]" />}
            </div>
            <div className="mt-4">
              <div className="font-mono text-[25px] font-bold tracking-[-0.06em] text-[hsl(var(--foreground))]">{loading ? <span className="inline-block h-7 w-20 rounded shimmer align-middle" /> : stat.value}</div>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[hsl(var(--foreground)/.75)]">{stat.label}</span>
                <span className="text-[hsl(var(--muted-foreground))]">{stat.note}</span>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}