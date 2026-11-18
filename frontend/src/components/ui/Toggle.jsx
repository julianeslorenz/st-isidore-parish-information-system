export default function Toggle({ label, ...props }) {
  return <input type="checkbox" role="switch" className="toggle" aria-label={label} {...props} />;
}
