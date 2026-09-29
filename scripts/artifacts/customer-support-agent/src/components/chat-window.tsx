import { Bot, Check, Copy, ExternalLink, LoaderCircle, Send, Sparkles, UserRound } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatResponse, CustomerDetail } from '@workspace/api-client-react';
import { useSendSupportMessage } from '@workspace/api-client-react';

type ThreadMessage = { id: string; role: 'agent' | 'assistant'; message: string; response?: ChatResponse };

export function ChatWindow({ customer }: { customer?: CustomerDetail }) {
  const sendMessage = useSendSupportMessage();
  const [draft, setDraft] = useState('');
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread, sendMessage.isPending]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!customer || !message || sendMessage.isPending) return;
    const localId = `local-${Date.now()}`;
    setThread((items) => [...items, { id: localId, role: 'agent', message }]);
    setDraft('');
    sendMessage.mutate({ customerId: customer.id, data: { message } }, { onSuccess: (response) => setThread((items) => [...items, { id: response.id, role: 'assistant', message: response.message, response }]) });
  };

  const firstName = customer?.name.split(' ')[0] ?? 'the customer';
  return (
    <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-[var(--shadow-xs)]" data-testid="panel-chat">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3.5 sm:px-5"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]"><Bot size={17} /></span><div><p className="eyebrow text-[hsl(var(--primary))]">Live assist</p><h2 className="mt-0.5 text-sm font-bold">Reply with context</h2></div></div><div className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary)/.09)] px-2.5 py-1 text-[9px] font-bold text-[hsl(var(--primary))]"><span className="size-1.5 rounded-full bg-[hsl(var(--primary))]" /> Memory on</div></div>
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {thread.length === 0 && <div className="py-10 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]"><Sparkles size={20} /></div><h3 className="mt-4 text-sm font-bold">A clear first reply starts here</h3><p className="mx-auto mt-1.5 max-w-[250px] text-xs leading-5 text-[hsl(var(--muted-foreground))]">Ask EchoDesk to draft a thoughtful response for {firstName}, grounded in what has worked before.</p><div className="mx-auto mt-5 max-w-[270px] rounded-xl border border-dashed border-[hsl(var(--border))] px-3 py-2.5 text-left text-[10px] text-[hsl(var(--muted-foreground))]">Try: “What should I acknowledge before suggesting a fix?”</div></div>}
        {thread.map((item) => <div key={item.id} className={`flex gap-2.5 ${item.role === 'agent' ? 'justify-end' : 'justify-start'}`} data-testid={`chat-message-${item.id}`}><div className={`max-w-[88%] ${item.role === 'agent' ? 'order-first' : ''}`}><div className={`rounded-2xl px-3.5 py-3 text-xs leading-5 ${item.role === 'agent' ? 'rounded-br-md bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]' : 'rounded-bl-md border border-[hsl(var(--border))] bg-[hsl(var(--background)/.55)] text-[hsl(var(--foreground))]'}`}><p className="whitespace-pre-wrap">{item.message}</p></div>{item.response && <div className="mt-2 space-y-2">{item.response.citations.length > 0 && <div className="rounded-xl border border-[hsl(var(--primary)/.16)] bg-[hsl(var(--primary)/.05)] p-3"><div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-[hsl(var(--primary))]"><Sparkles size={11} /> Grounded in memory</div><div className="mt-2 space-y-2">{item.response.citations.map((citation) => <div key={citation.memoryId} className="flex gap-2 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]"><span className="mt-1 size-1 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span><strong className="font-bold text-[hsl(var(--foreground)/.78)]">{citation.title}</strong> — {citation.snippet}</span></div>)}</div></div>}{item.response.suggestedAction && <div className="flex items-center justify-between gap-2 rounded-xl bg-[hsl(var(--accent)/.11)] px-3 py-2 text-[10px]"><span className="flex items-center gap-1.5 font-semibold text-[hsl(var(--accent-foreground))]"><ExternalLink size={11} /> Suggested next step: {item.response.suggestedAction}</span><Copy size={12} className="shrink-0 text-[hsl(var(--muted-foreground))]" /></div>}{item.response.capturedMemory && <div className="flex items-center gap-1.5 text-[9px] font-bold text-[hsl(var(--primary))]"><Check size={11} /> New memory captured</div>}</div>}</div><span className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full ${item.role === 'agent' ? 'bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]' : 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]'}`}>{item.role === 'agent' ? <UserRound size={12} /> : <Bot size={12} />}</span></div>)}
        {sendMessage.isPending && <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]"><span className="grid size-6 place-items-center rounded-full bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]"><Bot size={12} /></span><span className="flex items-center gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.55)] px-3 py-2"><LoaderCircle size={12} className="animate-spin" /> Reading their history…</span></div>}
        {sendMessage.isError && <p className="rounded-lg bg-[hsl(var(--accent)/.1)] px-3 py-2 text-[10px] font-semibold text-[hsl(var(--accent-foreground))]" data-testid="status-chat-error">We couldn't reach the assist layer. Try sending that again.</p>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="border-t border-[hsl(var(--border))] p-3 sm:p-4" data-testid="form-chat"><div className="flex items-end gap-2 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.55)] p-2 focus-within:border-[hsl(var(--primary))] focus-within:ring-2 focus-within:ring-[hsl(var(--primary)/.1)]"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(event); } }} rows={2} placeholder="Ask about this customer…" className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-1.5 text-xs leading-5 outline-none placeholder:text-[hsl(var(--muted-foreground)/.7)]" disabled={!customer || sendMessage.isPending} data-testid="textarea-chat-message" /><button type="submit" disabled={!draft.trim() || sendMessage.isPending || !customer} className="grid size-9 shrink-0 place-items-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send support message" data-testid="button-send-message"><Send size={15} /></button></div><p className="mt-2 px-1 text-[9px] text-[hsl(var(--muted-foreground))]">Enter to send · Shift + Enter for a new line</p></form>
    </section>
  );
}