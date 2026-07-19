import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import AppShell from "../../components/AppShell";
import EmailSequenceGenerator from "../../components/EmailSequenceGenerator";

export const metadata = { title: "Email Sequences — CopyAI Pro" };

export default async function EmailsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <AppShell email={user.email} active="emails" title="Email Generator">
      <EmailSequenceGenerator />
    </AppShell>
  );
}
