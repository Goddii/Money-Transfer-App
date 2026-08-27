const PALETTE = ['#00C896', '#12875A', '#3A5BD9', '#D8323F', '#8A4FD9', '#141C3E'];

function colorFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ name = '?', size = 38 }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colorFor(name),
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {initials || '?'}
    </div>
  );
}
