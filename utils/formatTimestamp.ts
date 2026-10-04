import { DateTime } from 'luxon';

export const formatTimestamp = (timestamp: string) => {
    const time = DateTime.fromISO(timestamp);

    const dateString = time.toLocaleString(DateTime.DATE_HUGE);
    const timeString = time.toLocaleString(DateTime.TIME_WITH_SECONDS);
    return `${dateString} at ${timeString}`;
};
