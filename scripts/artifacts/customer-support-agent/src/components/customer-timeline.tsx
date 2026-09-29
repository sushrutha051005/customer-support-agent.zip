import { CalendarDays, CheckCircle2, CircleAlert, FileText, Mail, Phone, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { TimelineEvent } from '@workspace/api-client-react';

const eventIcon = { ticket: FileText, email: Mail, call: Phone, note: Sparkles };
const sentimentColor = { positive: 'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/.11)]', neutral: 'text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]', frustrated: 'text-[hsl(var(--accent-foreground))] bg-[hsl(var(--accent)/.15)]' };

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
}

export function CustomerTimeline({ events = [], loading }: { events?: TimelineEvent[]; loading?: boolean }) {
  const [showWorked, setShowWorked] = useState(false);
  const visibleEvents = showWorked ? events.filter((event) => event.solutionWorked) : events;
  return (
    <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)] sm:p-6" data-testid="panel-customer-timeline">
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[hsl(var(--primary))]">The long view</p><h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em]">Support timeline</h2></div><button type="button" onClick={() => setShowWorked((value) => !value)} className={`rounded-lg p-2 transition ${showWorked ? 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`} aria-label={showWorked ? 'Show all timeline events' : 'Show events with solutions that worked'} data-testid="button-filter-timeline"><CalendarDays size={16} /></button></div>
      <div className="relative mt-6">
        <div className="absolute bottom-3 left-[15px] top-1 w-px bg-[hsl(var(--border))]" />
        {loading ? <div className="space-y-7">{[1, 2, 3].map((item) => <div className="flex gap-4" key={item}><span className="z-10 size-8 shrink-0 rounded-full shimmer" /><div className="flex-1 space-y-2"><span className="block h-3 w-40 rounded shimmer" /><span className="block h-2.5 w-full rounded shimmer" /><span className="block h-2.5 w-3/4 rounded shimmer" /></div></div>)}</div> : visibleEvents.length === 0 ? <div className="rounded-xl bg-[hsl(var(--muted)/.6)] px-5 py-8 text-center"><CircleAlert className="mx-auto text-[hsl(var(--muted-foreground))]" size={20} /><p className="mt-2 text-sm font-semibold">{showWorked ? 'No proven solutions yet' : 'No history yet'}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{showWorked ? 'Filter off to see every support event.' : 'New conversations will appear here.'}</p></div> : visibleEvents.map((event) => { const Icon = eventIcon[event.type] ?? FileText; return <article key={event.id} className="relative mb-7 flex gap-4 last:mb-0" data-testid={`timeline-event-${event.id}`}><div className={`z-10 grid size-8 shrink-0 place-items-center rounded-full border-4 border-[hsl(var(--card))] ${sentimentColor[event.sentiment]}`}><Icon size={13} /></div><div className="min-w-0 flex-1 pb-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-bold">{event.title}</h3><span className="font-mono text-[9px] text-[hsl(var(--muted-foreground))]">{formatDate(event.occurredAt)}</span></div><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{event.summary}</p><div className="mt-2 flex flex-wrap items-center gap-2">{event.status === 'resolved' && <span className="flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--primary))]"><CheckCircle2 size={12} /> Resolved</span>}{event.solutionWorked && <span className="rounded-md bg-[hsl(var(--primary)/.1)] px-1.5 py-1 text-[9px] font-bold text-[hsl(var(--primary))]">Solution worked</span>}{event.sentiment === 'frustrated' && <span className="rounded-md bg-[hsl(var(--accent)/.14)] px-1.5 py-1 text-[9px] font-bold text-[hsl(var(--accent-foreground))]">Frustration noted</span>}</div></div></article>; })}
      </div>
    </section>
  );
}