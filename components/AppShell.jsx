import Link from "next/link";

const NAV = [
  { name: "dashboard", href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { name: "headlines", href: "/headlines", label: "Headlines", icon: "✍️" },
  { name: "emails", href: "/emails", label: "Emails", icon: "📧" },
  { name: "swipes", href: "/swipes", label: "Swipe File", icon: "🗂️" },
];

function NavLinks({ active, vertical }) {
  return NAV.map((item) => (
    <Link
      key={item.name}
      href={item.href}
      className={`flex items-center gap-3 rounded-lg text-sm font-medium transition ${
        vertical ? "px-3 py-2.5" : "shrink-0 px-3 py-1.5"
      } ${
        active === item.name
          ? "bg-gold-500/10 text-gold-500"
          : "text-neutral-400 hover:bg-ink-600/50 hover:text-white"
      }`}
    >
      <span aria-hidden="true">{item.icon}</span>
      {item.label}
    </Link>
  ));
}

function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className="btn-outline w-full">
        Sign out
      </button>
    </form>
  );
}

// App shell: fixed sidebar on desktop, top bar + horizontal nav on mobile.
export default function AppShell({ email, active, title, children }) {
  return (
    <div className="min-h-screen bg-ink-900 lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-600 bg-ink-800 lg:flex">
        <div className="sticky top-0 flex h-screen flex-col p-6">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            Copy<span className="text-gold-500">AI</span> Pro
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            <NavLinks active={active} vertical />
          </nav>
          <div className="mt-auto space-y-3">
            <p className="truncate text-xs text-neutral-500" title={email}>
              {email}
            </p>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <div className="flex-1">
        <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-800/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight">
              Copy<span className="text-gold-500">AI</span> Pro
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn-outline">
                Sign out
              </button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
            <NavLinks active={active} />
          </nav>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
          {title && (
            <h1 className="mb-8 text-2xl font-bold tracking-tight">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
