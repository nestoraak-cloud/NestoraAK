export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-24 text-[#261f17]/40 text-sm">
      {label}
    </div>
  );
}
