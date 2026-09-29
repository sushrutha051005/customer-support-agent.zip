import { Check, ChevronRight, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'wouter';
import { useMemo, useState } from 'react';
import type { Customer } from '@workspace/api-client-react';

const statusLabel: Record<Customer['status'], string> = { open: 'Needs reply', waiting: 'Waiting', resolved: 'Resolved' };

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function relativeTime(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  const diff = Math.max(0, Date.now() - parsed.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CustomerList({ customers = [], selectedId, onSelect, loading }: { customers?: Customer[]; selectedId?: string; onSelect?: (id: string) => void; loading?: boolean }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | Customer['status']>('all');
  const filtered = useMemo(() => customers.filter((customer) => {
    const matchesSearch = `${customer.name} ${customer.company} ${customer.email}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === 'all' || customer.status === status);
  }), [customers, search, status]);

  return (
    <section className="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-[var(--shadow-xs)]" data-testid="panel-customer-queue">
      <div className="border-b border-[hsl(var(--border))] px-4 pb-3 pt-4 sm:px-5">
        <div className="flex items-center justify-between">
          <div><p className="eyebrow text-[hsl(var(--primary))]">Your queue</p><h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em]">Customers to care for</h2></div>
          <button type="button" onClick={() => { setSearch(''); setStatus('open'); }} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]" aria-label="Focus on open queue" data-testid="button-filter-queue"><SlidersHorizontal size={16} /></button>
        </div>
        <div className="mt-4 flex gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.45)] px-3 py-2 text-[hsl(var(--muted-foreground))] focus-within:border-[hsl(var(--primary))] focus-within:ring-2 focus-within:ring-[hsl(var(--primary)/.1)]">
            <Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a customer" className="min-w-0 flex-1 bg-transparent text-xs text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/.7)]" data-testid="input-search-customers" />
          </label>
          <button type="button" onClick={() => setStatus((value) => value === 'all' ? 'open' : 'all')} className="grid size-9 shrink-0 place-items-center rounded-xl border border-[hsl(var(--input))] text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))]" aria-label="Toggle open customers filter" data-testid="button-show-filters"><Filter size={15} /></button>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto">
          {(['all', 'open', 'waiting', 'resolved'] as const).map((item) => <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize transition ${status === item ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'}`} data-testid={`button-filter-${item}`}>{item === 'all' ? 'All' : statusLabel[item]}</button>)}
        </div>
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto p-2">
        {loading ? <div className="space-y-2 p-2">{[1, 2, 3, 4].map((item) => <div key={item} className="flex gap-3 rounded-xl p-3"><span className="size-10 shrink-0 rounded-full shimmer" /><div className="flex-1 space-y-2"><span className="block h-3 w-28 rounded shimmer" /><span className="block h-2.5 w-40 rounded shimmer" /></div></div>)}</div> : filtered.length === 0 ? <div className="grid min-h-[280px] place-items-center px-7 text-center"><div><div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"><Search size={18} /></div><p className="mt-3 text-sm font-semibold">No one matches that search</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Try a name, company, or a different queue.</p></div></div> : filtered.map((customer) => <Link href={`/customers/${customer.id}`} key={customer.id} onClick={() => onSelect?.(customer.id)} className={`group mb-1 flex items-center gap-3 rounded-xl p-3 transition ${selectedId === customer.id ? 'bg-[hsl(var(--primary)/.1)] ring-1 ring-[hsl(var(--primary)/.2)]' : 'hover:bg-[hsl(var(--muted)/.7)]'}`} data-testid={`link-customer-${customer.id}`}>
          <div className="relative grid size-10 shrink-0 place-items-center rounded-full bg-[hsl(208_33%_27%)] text-[11px] font-bold text-[hsl(42_44%_94%)]">{/^https?:\/\//.test(customer.avatar) ? <img src={customer.avatar} alt="" className="size-full rounded-full object-cover" /> : customer.avatar || initials(customer.name)}{customer.status === 'open' && <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[hsl(var(--card))] bg-[hsl(var(--accent))]" />}</div>
          <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold">{customer.name}</p><span className="shrink-0 font-mono text-[9px] text-[hsl(var(--muted-foreground))]">{relativeTime(customer.lastSeenAt)}</span></div><p className="mt-0.5 truncate text-xs text-[hsl(var(--muted-foreground))]">{customer.company} <span className="mx-1 text-[hsl(var(--border))]">/</span> {customer.openTickets} open {customer.openTickets === 1 ? 'ticket' : 'tickets'}</p><div className="mt-2 flex items-center gap-1.5"><span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${customer.status === 'open' ? 'bg-[hsl(var(--accent)/.18)] text-[hsl(var(--accent-foreground))]' : customer.status === 'waiting' ? 'bg-[hsl(42_70%_57%/.18)] text-[hsl(38_55%_34%)]' : 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]'}`}>{statusLabel[customer.status]}</span>{customer.tags.slice(0, 1).map((tag) => <span key={tag} className="truncate rounded-md bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[9px] text-[hsl(var(--muted-foreground))]">{tag}</span>)}{customer.frustrationLevel > 65 && <span className="ml-auto text-[9px] font-semibold text-[hsl(var(--accent-foreground))]">High tension</span>}</div></div>
          {selectedId === customer.id ? <Check size={15} className="shrink-0 text-[hsl(var(--primary))]" /> : <ChevronRight size={15} className="shrink-0 text-[hsl(var(--muted-foreground)/.35)] transition group-hover:translate-x-0.5" />}
        </Link>)}
      </div>
    </section>
  );
}