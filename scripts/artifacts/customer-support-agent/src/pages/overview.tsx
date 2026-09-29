import { ArrowUpRight, History, Inbox, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { getGetCustomerQueryKey, getGetCustomerTimelineQueryKey, getGetSupportOverviewQueryKey, getListCustomersQueryKey, useGetCustomer, useGetCustomerTimeline, useGetSupportOverview, useListCustomers } from '@workspace/api-client-react';
import { ChatWindow } from '@/components/chat-window';
import { CustomerList } from '@/components/customer-list';
import { MemoryPanel } from '@/components/memory-panel';
import { OverviewStats } from '@/components/overview-stats';
import { CustomerTimeline } from '@/components/customer-timeline';

function OverviewLoading() {
  return <div className="space-y-5 p-4 sm:p-6 lg:p-8"><div className="space-y-3"><div className="h-3 w-24 rounded shimmer" /><div className="h-10 w-72 max-w-full rounded shimmer" /><div className="h-4 w-96 max-w-full rounded shimmer" /></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl shimmer" />)}</div><div className="grid gap-5 lg:grid-cols-[minmax(300px,390px)_1fr]"><div className="h-[500px] rounded-2xl shimmer" /><div className="h-[500px] rounded-2xl shimmer" /></div></div>;
}

export default function OverviewPage() {
  const [selectedId, setSelectedId] = useState('');
  const overviewQuery = useGetSupportOverview({ query: { queryKey: getGetSupportOverviewQueryKey(), staleTime: 20_000 } });
  const customersQuery = useListCustomers(undefined, { query: { queryKey: getListCustomersQueryKey(), staleTime: 20_000 } });
  const customers = customersQuery.data ?? [];
  const activeId = selectedId || customers[0]?.id || '';
  const customerQuery = useGetCustomer(activeId, { query: { enabled: Boolean(activeId), queryKey: getGetCustomerQueryKey(activeId) } });
  const timelineQuery = useGetCustomerTimeline(activeId, { query: { enabled: Boolean(activeId), queryKey: getGetCustomerTimelineQueryKey(activeId) } });
  const selectedCustomer = customerQuery.data;
  const recentActivity = useMemo(() => overviewQuery.data?.recentActivity?.slice(0, 3) ?? [], [overviewQuery.data?.recentActivity]);

  if (overviewQuery.isLoading && customersQuery.isLoading) return <OverviewLoading />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <section className="appear mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="eyebrow text-[hsl(var(--primary))]">Tuesday, October 24 · 09:41 AM</p><h1 className="mt-2 max-w-[700px] text-[clamp(2rem,4vw,3.3rem)] font-bold leading-[.96] tracking-[-0.065em] text-[hsl(var(--foreground))]">Make every reply feel like <span className="text-[hsl(var(--primary))]">the first one.</span></h1><p className="mt-3 max-w-[570px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">A calm view of the people who need you, with the useful parts of every past conversation close at hand.</p></div>
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--primary)/.06)] px-3 py-2.5 text-xs text-[hsl(var(--foreground)/.75)]"><ShieldCheck size={16} className="text-[hsl(var(--primary))]" /><span><strong className="font-bold">Context is current</strong><span className="ml-1 text-[hsl(var(--muted-foreground))]">for this queue</span></span></div>
      </section>
      <OverviewStats overview={overviewQuery.data} loading={overviewQuery.isLoading} />
      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(300px,390px)_minmax(0,1fr)]">
        <CustomerList customers={customers} selectedId={activeId} onSelect={setSelectedId} loading={customersQuery.isLoading} />
        <div className="min-w-0"><ChatWindow customer={selectedCustomer} /></div>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
        <MemoryPanel customer={selectedCustomer} onSaved={() => customerQuery.refetch()} />
        <CustomerTimeline events={timelineQuery.data} loading={timelineQuery.isLoading} />
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)] sm:p-6" data-testid="panel-recent-activity">
          <div className="flex items-center justify-between"><div><p className="eyebrow text-[hsl(var(--primary))]">Keep the thread</p><h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em]">Recent activity</h2></div><History size={17} className="text-[hsl(var(--muted-foreground))]" /></div>
          <div className="mt-5 divide-y divide-[hsl(var(--border))]">{recentActivity.length === 0 ? <div className="rounded-xl bg-[hsl(var(--muted)/.6)] px-5 py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">Nothing new in the last few hours.</div> : recentActivity.map((event) => <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={event.id} data-testid={`activity-${event.id}`}><span className={`size-2 shrink-0 rounded-full ${event.sentiment === 'frustrated' ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--primary))]'}`} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{event.title}</p><p className="mt-0.5 truncate text-[11px] text-[hsl(var(--muted-foreground))]">{event.summary}</p></div><span className="shrink-0 font-mono text-[9px] text-[hsl(var(--muted-foreground))]">{event.status}</span></div>)}</div>
        </div>
        <div className="rounded-2xl bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))] shadow-[var(--shadow-sm)] sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow text-[hsl(var(--sidebar-primary))]">A small ritual</p><h2 className="mt-2 text-xl font-bold tracking-[-0.04em]">Leave it better<br />than you found it.</h2></div><Inbox size={18} className="text-[hsl(var(--sidebar-primary))]" /></div><p className="mt-4 text-xs leading-5 text-[hsl(var(--sidebar-foreground)/.62)]">Capture one useful detail after each conversation. Tomorrow-you will thank today-you.</p><Link href={activeId ? `/customers/${activeId}` : '/'} className="mt-5 flex items-center justify-between rounded-xl border border-[hsl(var(--sidebar-border))] px-3 py-2.5 text-xs font-bold transition hover:bg-[hsl(var(--sidebar-accent))]" data-testid="link-open-customer"><span>Open customer memory</span><ArrowUpRight size={14} /></Link></div>
      </section>
      {overviewQuery.isError && <div className="mt-5 flex items-center justify-between rounded-xl border border-[hsl(var(--accent)/.25)] bg-[hsl(var(--accent)/.09)] px-4 py-3 text-xs text-[hsl(var(--accent-foreground))]" data-testid="status-overview-error"><span>Support health is taking a moment to load.</span><button type="button" onClick={() => overviewQuery.refetch()} className="font-bold underline" data-testid="button-retry-overview">Try again</button></div>}
    </div>
  );
}