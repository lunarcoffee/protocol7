import { DateTime } from 'luxon';

export const formatTimestampFull = (timestamp: string) => {
    const time = DateTime.fromISO(timestamp);

    const dateString = time.toLocaleString(DateTime.DATE_HUGE);
    const timeString = time.toLocaleString(DateTime.TIME_WITH_SECONDS);
    return `${dateString} at ${timeString}`;
};

export const formatTimestampShort = (timestamp: string) =>
    DateTime.fromISO(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
