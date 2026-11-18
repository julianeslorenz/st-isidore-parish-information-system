import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';
import { cn } from '../utils/cn.js';

/**
 * Split sign-in layout. variant="admin": form left, dark wine panel right.
 * variant="portal": gold panel left, form right (login, register, forgot password).
 * The decorative panel is hidden on phones and replaced by a compact header.
 */
export default function AuthLayout({ variant = 'portal', panel, children }) {
  const admin = variant === 'admin';
  const form = (
    <div key="form" className={cn('flex items-center justify-center p-8 max-md:items-start max-md:px-5 max-md:py-7', admin ? 'bg-paper' : 'bg-white')}>
      <div className="w-full max-w-[380px]">{children}</div>
    </div>
  );
  const side = (
    <div
      key="panel"
      className={cn(
        'relative flex flex-col justify-end overflow-hidden p-12 max-md:hidden',
        admin ? 'bg-wine-9 text-[#F3E7E9]' : 'bg-gold-soft text-ink',
      )}
    >
      {admin ? (
        <svg className="absolute -right-10 -top-2.5 opacity-90" width="420" height="560" viewBox="0 0 420 560" fill="none" stroke="#D6A94A" strokeOpacity=".35" strokeWidth="1.4" aria-hidden="true">
          <path d="M60 560V200C60 100 130 40 210 40s150 60 150 160v360" />
          <path d="M110 560V220C110 140 160 90 210 90s100 50 100 130v340" />
          <path d="M160 560V240c0-50 20-80 50-80s50 30 50 80v320" />
          <path d="M210 0v40" />
        </svg>
      ) : (
        <>
          <div className="absolute -right-[50px] top-[30px] h-[420px] w-[300px] rounded-t-[150px] bg-white opacity-55" aria-hidden="true" />
          <div className="absolute right-5 top-[90px] h-[330px] w-[180px] rounded-t-[90px] border-2 border-gold opacity-50" aria-hidden="true" />
        </>
      )}
      <div className="relative">
        <Logo size={admin ? 48 : 52} variant={admin ? 'light' : 'color'} />
        <h2 className={cn('mt-5 max-w-[420px] text-[32px] leading-[1.2]', admin ? '!text-white' : '!text-wine-9')}>{panel.title}</h2>
        <p className={cn('mt-3 max-w-[400px] text-[15px]', admin ? 'text-[#D9C3C7]' : 'text-ink-2')}>{panel.text}</p>
        {panel.extra}
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen grid-cols-2 max-md:grid-cols-1">
      <div className={cn('hidden items-center gap-2.5 px-5 py-[18px] max-md:flex', admin ? 'bg-wine-9 text-white' : 'bg-gold-1 text-wine-9')}>
        <Logo size={34} variant={admin ? 'light' : 'color'} />
        <b className="font-serif text-[17px] font-semibold">St. Isidore Parish</b>
      </div>
      {admin ? [form, side] : [side, form]}
    </div>
  );
}

export const BackToWebsite = () => (
  <p className="mt-[22px] text-center text-[12.5px] text-ink-3">
    <Link to="/" className="font-medium text-wine no-underline hover:underline">← Back to public website</Link>
  </p>
);
