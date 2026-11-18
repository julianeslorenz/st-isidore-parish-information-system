import Logo from '../ui/Logo.jsx';

const WORDING = {
  Baptism: 'was baptized in the Roman Catholic faith',
  Confirmation: 'received the Sacrament of Confirmation',
  Marriage: 'were united in the Sacrament of Matrimony',
  Funeral: 'was commended to God in the Funeral Rite',
};

/**
 * On-screen preview for parish STAFF only. It is not a printable or downloadable document:
 * the official certificate is printed on parish paper, signed by the priest and sealed by the office.
 */
export default function CertificatePreview({ type, name, number, date }) {
  return (
    <div className="rounded-md border border-[#E8D9B2] bg-[#FFFDF8] p-2.5">
      <div className="border-[3px] border-double border-gold px-5 py-[26px] text-center">
        <div className="flex justify-center"><Logo size={40} /></div>
        <div className="mt-2 font-serif text-[13px] font-semibold text-ink-2">St. Isidore Parish Church</div>
        <div className="mb-3.5 mt-1.5 font-serif text-2xl font-semibold text-wine">Certificate of {type}</div>
        <p className="text-[12.5px] text-ink-2">This is to certify that</p>
        <div className="my-2 inline-block border-b border-line-2 px-5 pb-1 font-serif text-[26px] font-semibold">{name}</div>
        <p className="mt-2 text-[12.5px] text-ink-2">{WORDING[type]} on {date}.</p>
        <div className="mt-[26px] flex justify-around text-xs text-ink-2">
          <span className="min-w-[120px] border-t border-ink-3 pt-1">Parish priest</span>
          <span className="min-w-[120px] border-t border-ink-3 pt-1">Parish secretary</span>
        </div>
        <p className="mt-4 text-[12.5px] text-ink-3">Certificate no. {number}</p>
      </div>
    </div>
  );
}
