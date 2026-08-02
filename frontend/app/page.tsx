import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Logo from './components/Logo';
import Plexus from './components/Plexus';
import { BTN_PRIMARY } from './lib/theme';

const FEATURES = [
  {
    title: 'Massive Food Database',
    description: 'Search nutritional info across 15,000+ foods, standardised down to the gram.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    title: 'Effortless Meal Logging',
    description: 'Log breakfast, lunch, snacks and dinner in seconds and watch your macros update live.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    gradient: 'from-violet-500 to-pink-500',
  },
  {
    title: 'Daily Dashboard',
    description: 'A single snapshot of calories, protein, carbs, fats and fibre against your personal goals.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    gradient: 'from-pink-500 to-amber-500',
  },
  {
    title: 'Personalised Goals',
    description: 'Tell us your stats and activity level — CalepoFT tailors targets to your body and goals.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    gradient: 'from-amber-500 to-indigo-500',
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      <Plexus className="pointer-events-none fixed inset-0 h-full w-full opacity-50" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link
            href="/sign-up"
            className="hidden rounded-2xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:block"
          >
            Sign up
          </Link>
          <Link
            href="/sign-in"
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold ${BTN_PRIMARY}`}
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-24 pt-10 md:px-10 lg:grid-cols-2 lg:pt-16">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-200 ring-1 ring-white/10">
            Nutrition &amp; fitness tracking, simplified
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Decode your nutrition with{' '}
            <span className="text-gradient-brand">CalepoFT</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            CalepoFT is your all-in-one nutrition tracker — search a database of over 15,000 foods,
            log every meal in seconds, and watch a live dashboard turn your calories, protein, carbs,
            fats and fibre into goals you can actually hit.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/sign-in"
              className={`rounded-2xl px-7 py-3.5 text-base font-semibold ${BTN_PRIMARY}`}
            >
              Login to CalepoFT
            </Link>
            <Link
              href="/sign-up"
              className="rounded-2xl px-7 py-3.5 text-base font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">First time here? Sign up takes under a minute.</p>
        </div>

        <div className="relative hidden h-full min-h-[22rem] lg:block">
          <div className="absolute right-10 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to stay on track</h2>
            <p className="mt-3 text-slate-300">
              From searching foods to hitting weekly goals — CalepoFT keeps your nutrition data in one clean place.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/10">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-white`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center md:px-10">
        <h2 className="text-3xl font-bold sm:text-4xl">Ready to see what you&apos;re really eating?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Log in with your CalepoFT account and pick up your dashboard right where you left off.
        </p>
        <div className="mt-8">
          <Link
            href="/sign-in"
            className={`inline-block rounded-2xl px-8 py-3.5 text-base font-semibold ${BTN_PRIMARY}`}
          >
            Login
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-xs text-slate-500 md:px-10">
        © {new Date().getFullYear()} CalepoFT. Track your meals and hit your fitness goals.
      </footer>
    </div>
  );
}
