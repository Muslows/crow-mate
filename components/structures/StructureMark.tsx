export function StructureMark({
  tag,
  name,
  logoUrl,
}: {
  tag: string;
  name: string;
  logoUrl?: string | null;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`Logo ${name}`}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 border border-orange-400/50 object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-14 w-14 shrink-0 items-center justify-center border border-orange-400/50 bg-gradient-to-br from-orange-400/25 via-black to-emerald-400/20 font-mono text-sm tracking-[0.12em] text-orange-100"
    >
      {tag.slice(0, 3)}
    </span>
  );
}
