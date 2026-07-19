import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getSwipes } from "../../lib/mockDb";
import { resolveTier } from "../../lib/tier";
import AppShell from "../../components/AppShell";
import UpgradeButton from "../../components/UpgradeButton";

export const metadata = { title: "Dashboard — CopyAI Pro" };

export default async function DashboardPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const tierInfo = resolveTier(user);
  const upgraded = searchParams?.upgraded === "1";

  const { data: headlines } = await supabase
    .from("headlines")
    .select("id, brief, text, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const swipes = getSwipes(user.id);

  const stats = [
    { label: "Headlines generated", value: (headlines ?? []).length, href: "/headlines" },
    { label: "Swipes saved", value: swipes.length, href: "/swipes" },
  ];

  const tools = [
    {
      href: "/headlines",
      icon: "✍️",
      title: "Headline Generator",
      description: "Turn a client brief into 10 headline angles.",
    },
    {
      href: "/emails",
      icon: "📧",
      title: "Email Generator",
      description: "Draft a full email sequence in your tone.",
    },
    {
      href: "/swipes",
      icon: "🗂️",
      title: "Swipe File",
      description: "Your saved lines, all in one place.",
    },
  ];

  const recent = (headlines ?? []).slice(0, 5);

  return (
    <AppShell email={user.email} active="dashboard" title="Dashboard">
      {upgraded && (
        <div className="mb-6 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
          Welcome to Pro! 🎉 Your subscription is active — everything is unlimited.
        </div>
      )}

      {/* Plan / billing */}
      <div className="card mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Current plan
          </p>
          <p className="mt-1 text-lg font-semibold text-gold-500">{tierInfo.label}</p>
          {tierInfo.headlinesLimit !== null && (
            <p className="mt-1 text-sm text-neutral-400">
              {tierInfo.headlinesUsed}/{tierInfo.headlinesLimit} headlines used this month
            </p>
          )}
        </div>
        {tierInfo.tier === "free" && <UpgradeButton />}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-6 transition hover:border-gold-500/50">
            <p className="text-3xl font-extrabold text-gold-500">{s.value}</p>
            <p className="mt-1 text-sm text-neutral-400">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Tools */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="card p-6 transition hover:border-gold-500/50 hover:shadow-glow"
          >
            <div className="text-2xl" aria-hidden="true">{t.icon}</div>
            <h2 className="mt-3 font-semibold">{t.title}</h2>
            <p className="mt-1 text-sm text-neutral-400">{t.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent headlines</h2>
          {recent.length > 0 && (
            <Link href="/headlines" className="text-sm font-medium text-gold-500 hover:text-gold-400">
              View all →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <p className="text-sm text-neutral-400">
              No headlines yet —{" "}
              <Link href="/headlines" className="font-semibold text-gold-500 hover:text-gold-400">
                generate your first batch
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((h) => (
              <li key={h.id} className="card px-4 py-3 text-sm text-neutral-200">
                {h.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
