const SIZES = {
  sm: { box: 'w-7 h-7', icon: 14, title: 'text-base', subtitle: 'hidden' },
  md: { box: 'w-9 h-9', icon: 18, title: 'text-xl', subtitle: 'text-[11px]' },
  lg: { box: 'w-12 h-12', icon: 24, title: 'text-2xl', subtitle: 'text-xs' },
} as const;

export default function Logo({
  size = 'md',
  showSubtitle = false,
}: {
  size?: keyof typeof SIZES;
  showSubtitle?: boolean;
}) {
  const s = SIZES[size];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} shrink-0 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md shadow-violet-500/30`}>
        <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="white" stroke="none">
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      </div>
      <div>
        <h1 className={`${s.title} font-bold leading-tight text-gradient-brand`}>CalepoFT</h1>
        {showSubtitle && <p className={`${s.subtitle} text-slate-400 leading-tight`}>Nutrition &amp; Fitness Tracker</p>}
      </div>
    </div>
  );
}
