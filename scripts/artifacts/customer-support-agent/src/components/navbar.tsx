import { Activity, ArrowUpRight, Command, Inbox, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { getHealthCheckQueryKey, useHealthCheck } from '@workspace/api-client-react';

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: health } = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey(), staleTime: 30_000 },
  });

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="mr-1 rounded-lg p-2 text-[hsl(var(--sidebar-foreground))] transition hover:bg-[hsl(var(--sidebar-accent))] lg:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              data-testid="button-toggle-navigation"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <Link href="/" className="flex items-center gap-3" data-testid="link-home">
              <span className="grid size-9 place-items-center rounded-xl bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-[0_0_0_5px_hsl(var(--sidebar-primary)/.11)]">
                <Command size={17} strokeWidth={2.5} />
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-[15px] font-bold tracking-[-0.03em]">EchoDesk</span>
                <span className="eyebrow mt-0.5 block text-[hsl(var(--sidebar-foreground)/.48)]">memory-aware support</span>
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.54)] px-3 py-2 text-xs text-[hsl(var(--sidebar-foreground)/.66)]">
              <Search size={14} />
              <span>Search workspace</span>
              <kbd className="ml-5 rounded border border-[hsl(var(--sidebar-border))] px-1.5 py-0.5 font-mono text-[10px] text-[hsl(var(--sidebar-foreground)/.42)]">⌘ K</kbd>
            </div>
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${location === '/' ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.62)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}
              data-testid="link-inbox"
            >
              <Inbox size={15} />
              Inbox
              <span className="rounded-md bg-[hsl(var(--accent))] px-1.5 py-0.5 font-mono text-[10px] text-[hsl(var(--accent-foreground))]">8</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-[11px] text-[hsl(var(--sidebar-foreground)/.58)] sm:flex" data-testid="status-health">
              <span className={`size-1.5 rounded-full ${health?.status === 'ok' ? 'bg-[hsl(var(--sidebar-primary))]' : 'bg-[hsl(var(--accent))]'}`} />
              {health?.status === 'ok' ? 'All systems calm' : 'Checking systems'}
            </div>
            <div className="flex size-9 items-center justify-center rounded-full border border-[hsl(var(--sidebar-primary)/.38)] bg-[hsl(var(--sidebar-primary)/.14)] text-xs font-bold text-[hsl(var(--sidebar-primary))]" data-testid="avatar-agent">
              AR
            </div>
          </div>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[68px] z-30 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-5 py-4 lg:hidden">
          <Link href="/" className="flex items-center justify-between rounded-xl bg-[hsl(var(--sidebar-accent))] px-4 py-3 text-sm font-semibold" onClick={() => setMobileOpen(false)} data-testid="link-mobile-inbox">
            <span className="flex items-center gap-2"><Inbox size={16} /> Inbox</span>
            <ArrowUpRight size={15} />
          </Link>
          <div className="mt-3 flex items-center gap-2 px-4 text-xs text-[hsl(var(--sidebar-foreground)/.55)]">
            <ShieldCheck size={14} className="text-[hsl(var(--sidebar-primary))]" /> Context protected and current
          </div>
        </div>
      )}
    </>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="noise-surface min-h-[100dvh] bg-[hsl(var(--background))]">
      <Navbar />
      <main className="mx-auto max-w-[1600px]">{children}</main>
    </div>
  );
}