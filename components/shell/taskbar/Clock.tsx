import { useCurrentTime } from '@/hooks/useCurrentTime';

import { Hoverable } from './Hoverable';

export const Clock = () => {
  const currentTime = useCurrentTime();
  
  // sorry non-en-US locales :(
  const time = currentTime.toFormat('h:mm a');
  const date = currentTime.toFormat('L/d/yyyy');

  return (
    <Hoverable>
      <div className="h-full px-2 flex flex-col justify-center items-center text-gray-200 text-shadow-md text-shadow-aero-tint-darkest/50">
        <p className="text-xs z-10">{time}</p>
        <p className="text-xs z-10">{date}</p>
      </div>
    </Hoverable>
  );
};
