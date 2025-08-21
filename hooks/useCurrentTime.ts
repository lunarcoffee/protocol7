import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

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
  }, []);

  return time;
};
