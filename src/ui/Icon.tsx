export function Icon({
  name,
  size = 18,
}: {
  name:
    | 'play'
    | 'arrow'
    | 'coin'
    | 'sound'
    | 'mute'
    | 'pause'
    | 'back'
    | 'bolt'
    | 'check'
    | 'lock'
    | 'heart'
    | 'star';
  size?: number;
}) {
  const paths: Record<typeof name, string> = {
    play: 'm8 5 11 7-11 7Z',
    arrow: 'M4 12h15m-6-6 6 6-6 6',
    coin: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8',
    sound: 'm11 4-6 5H2v6h3l6 5V4Zm4 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14',
    mute: 'm11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6',
    pause: 'M8 5v14M16 5v14',
    back: 'M20 12H5m6-6-6 6 6 6',
    bolt: 'm13 2-9 12h7l-1 8 10-13h-7Z',
    check: 'm5 12 4 4L19 6',
    lock: 'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4',
    heart: 'M12 20 3 11C-2 3 8-1 12 6c4-7 14-3 9 5Z',
    star: 'm12 2 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z',
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === 'play' || name === 'heart' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
