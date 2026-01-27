export default function Calligraphy({
  children,
  className = '',
  size = 'text-2xl'
}: {
  children: React.ReactNode;
  className?: string;
  size?: string;
}) {
  return (
    <h1
      className={`logo logo--offset-small ${size} font-bold text-foreground tracking-widest whitespace-nowrap ${className}`}
      style={{ fontFamily: 'var(--font-ballet)' }}
    >
      {children}
    </h1>
  );
}