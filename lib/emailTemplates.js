// MOCK: hardcoded email sequences by industry + tone.
// TODO: replace with an OpenAI call when the real backend lands.

export const INDUSTRIES = ["SaaS", "Ecommerce", "Coaching", "Agency", "Newsletter"];
export const TONES = ["Casual", "Formal", "Funny"];

// Openers/closers vary by tone; bodies vary by industry.
const TONE_PARTS = {
  Casual: {
    greeting: "Hey there,",
    signoff: "Talk soon,\nThe Team",
    ps: "P.S. Hit reply anytime — a real human reads these.",
  },
  Formal: {
    greeting: "Dear Subscriber,",
    signoff: "Best regards,\nThe Team",
    ps: "P.S. Should you have any questions, our team is at your disposal.",
  },
  Funny: {
    greeting: "Well hello, you magnificent inbox-opener,",
    signoff: "High fives,\nThe Team 🙌",
    ps: "P.S. This email contains 0% spam and 100% recycled electrons.",
  },
};

const INDUSTRY_PARTS = {
  SaaS: {
    welcome:
      "Welcome aboard! Your account is live and ready. The fastest way to see value: connect your data and run your first report — most users do this in under 5 minutes.",
    value:
      "Did you know teams using our automation features save an average of 6 hours a week? Here are the 3 workflows our power users set up first.",
    offer:
      "Your trial ends soon — upgrade this week and get 20% off your first year. Every feature you've tried stays exactly where you left it.",
  },
  Ecommerce: {
    welcome:
      "Thanks for joining! As a welcome gift, here's 10% off your first order. Browse our bestsellers to see what everyone's loving right now.",
    value:
      "Behind every product we ship is a story — sustainable sourcing, small-batch quality, and a guarantee we actually honor. Here's what makes us different.",
    offer:
      "Your 10% welcome code expires in 48 hours. Pair it with free shipping on orders over $50 and treat yourself — you've earned it.",
  },
  Coaching: {
    welcome:
      "I'm so glad you're here. You've just taken the first step most people never take. Over the next few days I'll share the exact framework my clients use.",
    value:
      "Last month a client went from stuck to fully booked in 6 weeks. The shift wasn't working harder — it was one mindset change I walk you through here.",
    offer:
      "Doors to my group program close Friday. If you've been waiting for a sign, this is it — spots are limited and I'd love to work with you.",
  },
  Agency: {
    welcome:
      "Welcome! You're now on the list where we share what actually works in client campaigns — no fluff, just tactics from real engagements.",
    value:
      "Case study: how we took a client from 2k to 40k monthly visitors in 6 months. The full teardown, including what failed first, is inside.",
    offer:
      "We're opening 3 strategy-call slots this month. If you want eyes on your funnel from the team behind these results, grab one before they're gone.",
  },
  Newsletter: {
    welcome:
      "You're in! Every week you'll get one deeply-researched piece — no filler, no forwarded memes, just the good stuff, straight to your inbox.",
    value:
      "Readers tell us the archive alone is worth the subscription. Here are the 5 most-shared issues from the past year to get you started.",
    offer:
      "Enjoying the free issues? Premium members get the full archive, subscriber-only deep dives, and the community Slack. First month's on us.",
  },
};

const SEQUENCE = [
  { key: "welcome", label: "Email 1 — Welcome", subject: (i) => `Welcome! Here's how to get started` },
  { key: "value", label: "Email 2 — Value", subject: (i) => `The one thing our best ${i} customers do` },
  { key: "offer", label: "Email 3 — CTA / Offer", subject: (i) => `Don't miss this (expires soon)` },
];

export function generateSequence(industry, tone) {
  const t = TONE_PARTS[tone];
  const ind = INDUSTRY_PARTS[industry];
  if (!t || !ind) return null;

  return SEQUENCE.map(({ key, label, subject }) => ({
    label,
    subject: subject(industry.toLowerCase()),
    body: `${t.greeting}\n\n${ind[key]}\n\n${t.signoff}\n\n${t.ps}`,
  }));
}
