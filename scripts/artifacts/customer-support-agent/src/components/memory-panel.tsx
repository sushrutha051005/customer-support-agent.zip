import { Brain, Check, ChevronDown, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import type { CustomerDetail } from '@workspace/api-client-react';
import { useAddCustomerMemory } from '@workspace/api-client-react';

const kinds = ['preference', 'issue', 'environment', 'solution', 'note'] as const;

export function MemoryPanel({ customer, onSaved }: { customer?: CustomerDetail; onSaved?: () => void }) {
  const addMemory = useAddCustomerMemory();
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<(typeof kinds)[number]>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!customer || !title.trim() || !content.trim()) return;
    addMemory.mutate({ customerId: customer.id, data: { kind, title: title.trim(), content: content.trim() } }, {
      onSuccess: () => { setTitle(''); setContent(''); setAdding(false); onSaved?.(); },
    });
  };

  if (!customer) return <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5"><div className="h-5 w-32 rounded shimmer" /><div className="mt-5 h-20 rounded shimmer" /></div>;

  return (
    <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-xs)] sm:p-6" data-testid="panel-memory">
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-[hsl(var(--primary))]">Context, not clutter</p><h2 className="mt-1 flex items-center gap-2 text-[17px] font-bold tracking-[-0.03em]"><Brain size={17} className="text-[hsl(var(--primary))]" /> Customer memory</h2></div><button type="button" onClick={() => setAdding((value) => !value)} className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary)/.1)] px-2.5 py-2 text-[10px] font-bold text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary)/.16)]" data-testid="button-add-memory">{adding ? <X size={14} /> : <Plus size={14} />}{adding ? 'Close' : 'Add memory'}</button></div>
      <div className="mt-5 rounded-xl border border-[hsl(var(--primary)/.18)] bg-[hsl(var(--primary)/.06)] p-3.5"><div className="flex items-start gap-2.5"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" /><div><p className="text-xs font-bold">A little context goes a long way</p><p className="mt-1 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">These notes stay with {customer.name.split(' ')[0]} so the next reply starts from understanding.</p></div></div></div>
      {adding && <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.55)] p-3.5" data-testid="form-add-memory"><div className="grid gap-3 sm:grid-cols-[140px_1fr]"><label className="relative"><span className="eyebrow mb-1.5 block text-[hsl(var(--muted-foreground))]">Type</span><select value={kind} onChange={(event) => setKind(event.target.value as (typeof kinds)[number])} className="w-full appearance-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs capitalize outline-none focus:border-[hsl(var(--primary))]" data-testid="select-memory-kind">{kinds.map((item) => <option value={item} key={item}>{item}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute bottom-2.5 right-2.5 text-[hsl(var(--muted-foreground))]" /></label><label><span className="eyebrow mb-1.5 block text-[hsl(var(--muted-foreground))]">Short title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Prefers concise replies" className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs outline-none focus:border-[hsl(var(--primary))]" data-testid="input-memory-title" /></label></div><label className="block"><span className="eyebrow mb-1.5 block text-[hsl(var(--muted-foreground))]">What should we remember?</span><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={3} placeholder="Add a useful detail for future conversations..." className="w-full resize-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs leading-5 outline-none focus:border-[hsl(var(--primary))]" data-testid="textarea-memory-content" /></label><div className="flex justify-end"><button type="submit" disabled={addMemory.isPending || !title.trim() || !content.trim()} className="rounded-lg bg-[hsl(var(--primary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-save-memory">{addMemory.isPending ? 'Saving…' : 'Save to memory'}</button></div></form>}
      <div className="mt-5 space-y-3">{customer.memories.length === 0 ? <div className="rounded-xl bg-[hsl(var(--muted)/.65)] px-5 py-8 text-center"><Sparkles className="mx-auto text-[hsl(var(--muted-foreground))]" size={18} /><p className="mt-2 text-sm font-semibold">No memories saved yet</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Capture the details that make the next reply easier.</p></div> : customer.memories.map((memory) => <div key={memory.id} className="rounded-xl border border-[hsl(var(--border))] p-3.5 transition hover:border-[hsl(var(--primary)/.35)]" data-testid={`memory-${memory.id}`}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="rounded-md bg-[hsl(var(--muted))] px-1.5 py-1 text-[9px] font-bold capitalize text-[hsl(var(--muted-foreground))]">{memory.kind}</span><h3 className="truncate text-xs font-bold">{memory.title}</h3></div><span className="shrink-0 font-mono text-[9px] text-[hsl(var(--primary))]">{Math.round(memory.confidence * 100)}% sure</span></div><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{memory.content}</p><p className="mt-2 flex items-center gap-1 text-[9px] text-[hsl(var(--muted-foreground)/.8)]"><Check size={11} /> {memory.source}</p></div>)}</div>
    </section>
  );
}