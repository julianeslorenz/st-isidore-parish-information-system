// Brand mark. Inline SVG is required because it is the logo, not an interface icon.
export default function Logo({ size = 36, variant = 'color', className }) {
  const light = variant === 'light';
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path
        d="M4 40V17C4 7 11 2 20 2s16 5 16 15v23z"
        fill={light ? '#fff' : '#6B1D2A'}
        fillOpacity={light ? 0.14 : 1}
        stroke={light ? '#D6A94A' : 'none'}
        strokeWidth={light ? 1.6 : 0}
      />
      <path d="M20 10v21M13.5 16.5h13" stroke="#D6A94A" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
