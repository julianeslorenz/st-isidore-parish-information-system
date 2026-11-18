import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const item = 'relative flex flex-1 flex-col items-center gap-0.5 border-0 bg-transparent py-1 text-[11.5px] font-medium no-underline';

/**
 * Phone-only tab bar. Admin passes `onMore` for the "More" drawer button; the portal does not.
 * `badges` maps a tab's badgeKey (or literal badge) to its count.
 */
export default function BottomNavigation({ tabs, onMore, badgeTone = 'gold', label = 'Quick navigation' }) {
  return (
    <nav aria-label={label} className="no-print fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] md:hidden">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => cn(item, isActive ? 'text-wine' : 'text-ink-3')}>
          {({ isActive }) => (
            <>
              <tab.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
              {tab.label}
              {tab.badge ? (
                <span className={cn('absolute left-[55%] top-0 rounded-full px-[5px] text-[10.5px] font-semibold leading-4', badgeTone === 'gold' ? 'bg-gold text-gold-ink' : 'bg-wine text-white')}>{tab.badge}</span>
              ) : null}
            </>
          )}
        </NavLink>
      ))}
      {onMore && (
        <button type="button" onClick={onMore} className={cn(item, 'text-ink-3')}>
          <Menu size={22} aria-hidden="true" />
          More
        </button>
      )}
    </nav>
  );
}
