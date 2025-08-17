import { useCurrentTime } from '@/hooks/useCurrentTime';

import { Hoverable } from './Hoverable';

export const Clock = () => {
  const currentTime = useCurrentTime();

  // sorry non-en-US locales :(
  const time = currentTime.toFormat('h:mm a');
  const date = currentTime.toFormat('L/d/yyyy');

  return (
    <Hoverable>
      <div
        className={`
          flex h-full flex-col items-center justify-center px-2 text-gray-200
          text-shadow-aero-tint-darkest/50 text-shadow-md
        `}
      >
        <p className="z-10 text-xs">{time}</p>
        <p className="z-10 text-xs">{date}</p>
      </div>
    </Hoverable>
  );
};
