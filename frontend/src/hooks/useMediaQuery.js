import { useEffect, useState } from 'react';

// Used where behaviour (not just layout) differs on small screens, e.g. opening a sheet instead of a side panel.
export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

// "Mobile" in the prototype means the 880px container breakpoint.
export const useIsMobile = () => useMediaQuery('(max-width: 880px)');
