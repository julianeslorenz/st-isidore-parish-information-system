export default function DateTile({ month = 'Oct', day }) {
  return (
    <div className="w-[46px] flex-none rounded-lg bg-wine-1 py-[5px] text-center leading-[1.1] text-wine" aria-hidden="true">
      <small className="text-[11.5px] font-medium">{month}</small>
      <b className="block font-serif text-lg font-semibold">{day}</b>
    </div>
  );
}
