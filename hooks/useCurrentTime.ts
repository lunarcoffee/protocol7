import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

const TIME_UPDATE_INTERVAL = 100;

const currentTime = () => DateTime.now();

export const useCurrentTime = () => {
  const [time, setTime] = useState(currentTime());

  useEffect(() => {
    const interval = setInterval(
      () => setTime(currentTime()),
      TIME_UPDATE_INTERVAL,
    );
    return () => clearInterval(interval);
  }, [setTime]);

  return time;
};
