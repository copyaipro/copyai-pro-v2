import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { listSwipes } from "../../lib/data";
import AppShell from "../../components/AppShell";

export const metadata = { title: "Swipe File — CopyAI Pro" };

const TYPE_LABELS = { email: "Email", headline: "Headline" };

export default async function SwipesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const swipes = await listSwipes(supabase, user);

  return (
    <AppShell email={user.email} active="swipes" title="Swipe File">
      {swipes.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-3xl" aria-hidden="true">🗂️</div>
          <h2 className="mt-4 text-lg font-semibold">Your swipe file is empty</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-400">
            Save your best lines from the email generator and they&apos;ll show up
            here — your personal copy vault.
          </p>
          <Link href="/emails" className="btn-gold mt-6 inline-block">
            Generate emails
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">
            {swipes.length} saved {swipes.length === 1 ? "swipe" : "swipes"}
          </p>
          {swipes.map((s) => (
            <div key={s.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full border border-gold-500/40 bg-gold-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-gold-500">
                    {TYPE_LABELS[s.type] ?? s.type}
                  </span>
                  <h3 className="mt-2 font-semibold">{s.title}</h3>
                </div>
                <p className="shrink-0 text-xs text-neutral-500">
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-ink-800 px-4 py-3 font-sans text-sm leading-relaxed text-neutral-300">
                {s.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
