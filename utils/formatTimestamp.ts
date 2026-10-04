import { DateTime } from 'luxon';

export const formatTimestamp = (timestamp: string) =>
    DateTime.fromISO(timestamp).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
