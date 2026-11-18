import { Link } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import Container from '../ui/Container.jsx';
import { PARISH, PUBLIC_NAV } from '../../data/parish.js';

const link = 'block py-[3px] text-wine-2 no-underline hover:underline';

export default function PublicFooter() {
  return (
    <footer className="bg-wine-9 pb-[26px] pt-9 text-[#D9C3C7]">
      <Container className="grid grid-cols-[2fr_1fr_1fr_1.4fr] gap-7 max-md:grid-cols-2 max-sm:grid-cols-1">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={34} variant="light" />
            <b className="font-serif text-lg font-semibold text-white">{PARISH.name}</b>
          </div>
          <p className="mt-2.5 text-[12.5px]">The official digital portal of St. Isidore Parish.</p>
        </div>
        <div>
          <b className="mb-1.5 block text-white">Explore</b>
          {PUBLIC_NAV.slice(1).map((n) => <Link key={n.to} to={n.to} className={link}>{n.label}</Link>)}
        </div>
        <div>
          <b className="mb-1.5 block text-white">Account</b>
          <Link to="/login" className={link}>Login</Link>
          <Link to="/register" className={link}>Create account</Link>
          <Link to="/forgot-password" className={link}>Forgot password</Link>
          <Link to="/admin/login" className={link}>Parish staff sign in</Link>
        </div>
        <div>
          <b className="mb-1.5 block text-white">Parish office</b>
          <span className="text-[12.5px]">
            {PARISH.address}<br />{PARISH.phone}<br />{PARISH.email}<br />Mon to Fri, 8:00 AM to 5:00 PM
          </span>
        </div>
      </Container>
      <Container className="mt-[22px] flex flex-wrap gap-4 text-[12.5px] opacity-65">
        <span>Sample content for design review.</span>
        <Link to="/design-system" className="text-inherit underline">Design system</Link>
      </Container>
    </footer>
  );
}
