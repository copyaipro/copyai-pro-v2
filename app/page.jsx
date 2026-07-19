import Link from "next/link";
import EmailCapture from "../components/EmailCapture";

const features = [
  {
    icon: "✍️",
    title: "Headline Generator",
    description:
      "Stop staring at a blank page at 11pm before a client deadline. Feed it your brief and get 10 headline angles — direct, curiosity, benefit-led — in seconds.",
  },
  {
    icon: "📧",
    title: "Email Generator",
    description:
      "Cold outreach, launch sequences, client follow-ups. Generate first drafts that sound like you wrote them, not like a robot filling a template.",
  },
  {
    icon: "🗂️",
    title: "Swipe File",
    description:
      "Every great line you generate (or find in the wild) saved in one searchable place. Your personal copy vault, organized by client and campaign.",
  },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Try it on your next project",
    features: [
      "10 headlines per month",
      "Basic headline styles",
      "Personal swipe file (25 saves)",
      "Community support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Freelancer",
    price: "$19",
    period: "/month",
    tagline: "For working copywriters",
    features: [
      "Unlimited headlines",
      "Email generator (all sequence types)",
      "Unlimited swipe file + folders",
      "All tone & style presets",
      "Priority support",
    ],
    cta: "Get Early Access",
    highlighted: true,
  },
];

const footerLinks = {
  Product: ["Features", "Pricing", "Roadmap", "Changelog"],
  Company: ["About", "Blog", "Contact"],
  Legal: ["Privacy", "Terms"],
};

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-ink-600 bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#" className="text-lg font-bold tracking-tight">
            Copy<span className="text-gold-500">AI</span> Pro
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-400 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-400 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-gold-400"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="waitlist" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-800 to-ink-900" />
        <div
          className="absolute left-1/2 top-0 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-block rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-500">
              Built for freelance copywriters &amp; designers
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Ship client copy in minutes,{" "}
              <span className="text-gold-500">not all-nighters.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
              CopyAI Pro drafts headlines and emails that match your voice, and keeps
              your best lines in a swipe file you&apos;ll actually use. You bill for
              strategy — let us handle the blank page.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-gold-500 px-8 py-3 text-base font-semibold text-ink-900 shadow-glow transition hover:bg-gold-400"
              >
                Start free
              </Link>
              <p className="text-sm text-neutral-500">or join the waitlist for updates</p>
              <EmailCapture />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three tools. Zero fluff.
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Everything you need to go from client brief to approved copy, faster.
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-8 transition hover:border-gold-500/50 hover:shadow-glow"
            >
              <div className="mb-4 text-3xl" aria-hidden="true">{f.icon}</div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-ink-800 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pricing that respects a freelancer&apos;s budget
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Less than one hour of your billable rate. Cancel anytime.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-3xl gap-8 md:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 ${
                  tier.highlighted
                    ? "border-gold-500 bg-ink-700 shadow-glow ring-1 ring-gold-500"
                    : "border-ink-600 bg-ink-700 shadow-card"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-ink-900">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{tier.tagline}</p>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                  <span className="ml-1 text-sm text-neutral-500">{tier.period}</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm text-neutral-300">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-lg px-4 py-3 text-center text-sm font-semibold transition ${
                    tier.highlighted
                      ? "bg-gold-500 text-ink-900 hover:bg-gold-400"
                      : "border border-ink-500 text-neutral-300 hover:border-gold-500 hover:text-gold-500"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-gold-500/40 bg-gradient-to-b from-ink-700 to-ink-800 px-6 py-16 text-center shadow-glow sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your next client brief doesn&apos;t stand a chance.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            Join the waitlist and be first in line when early access opens.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-gold-500 px-8 py-3 text-base font-semibold text-ink-900 transition hover:bg-gold-400"
            >
              Create your account
            </Link>
            <EmailCapture compact />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-600 bg-ink-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-lg font-bold tracking-tight">
                Copy<span className="text-gold-500">AI</span> Pro
              </p>
              <p className="mt-2 max-w-xs text-sm text-neutral-500">
                The AI copy assistant built for freelancers, not enterprises.
              </p>
            </div>
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  {group}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-neutral-400">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-gold-500">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-12 border-t border-ink-600 pt-6 text-xs text-neutral-600">
            © {new Date().getFullYear()} CopyAI Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
