import Link from "next/link";
import AuthForm from "../../components/AuthForm";

export const metadata = { title: "Sign up — CopyAI Pro" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="card w-full max-w-md p-8">
        <p className="text-lg font-bold tracking-tight">
          Copy<span className="text-gold-500">AI</span> Pro
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-400">Start generating headlines for free</p>
        <div className="mt-6">
          <AuthForm mode="signup" />
        </div>
        <p className="mt-6 text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold-500 hover:text-gold-400">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
