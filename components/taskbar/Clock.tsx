import { useCurrentTime } from '@/hooks/useCurrentTime';
import { DateTime } from 'luxon';
import { Hoverable } from './Hoverable';

export const Clock = () => {
  const currentTime = useCurrentTime();
  const time = currentTime.toLocaleString(DateTime.TIME_SIMPLE);
  const date = currentTime.toLocaleString(DateTime.DATE_SHORT);

  return (
    <Hoverable>
      <div className="h-full px-2 flex flex-col justify-center items-center text-gray-200 text-shadow-md text-shadow-aero-tint-darkest/50">
        <p className="text-xs z-10">{time}</p>
        <p className="text-xs z-10">{date}</p>
      </div>
    </Hoverable>
  );
};
