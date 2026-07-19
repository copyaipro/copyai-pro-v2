import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import AppShell from "../../components/AppShell";
import HeadlineGenerator from "../../components/HeadlineGenerator";

export const metadata = { title: "Headlines — CopyAI Pro" };

export default async function HeadlinesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: headlines } = await supabase
    .from("headlines")
    .select("id, brief, text, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  // Group history by brief so each generation shows as one card.
  const groups = [];
  for (const h of headlines ?? []) {
    const last = groups[groups.length - 1];
    if (last && last.brief === h.brief) {
      last.items.push(h);
    } else {
      groups.push({ brief: h.brief, created_at: h.created_at, items: [h] });
    }
  }

  return (
    <AppShell email={user.email} active="headlines" title="Headline Generator">
      <div className="space-y-8">
        <HeadlineGenerator />

        <section>
          <h2 className="text-lg font-semibold">History</h2>
          {groups.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-400">
              No headlines yet — generate your first batch above.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {groups.map((group) => (
                <div key={group.items[0].id} className="card p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {new Date(group.created_at).toLocaleString()}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm italic text-neutral-400">
                    “{group.brief}”
                  </p>
                  <ul className="mt-4 space-y-2">
                    {group.items.map((h) => (
                      <li
                        key={h.id}
                        className="rounded-lg bg-ink-800 px-4 py-2.5 text-sm text-neutral-200"
                      >
                        {h.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
