import { DateTime } from 'luxon';

import { useCurrentTime } from '@/hooks/useCurrentTime';

import { Tooltip } from '../controls/Tooltip';
import { Hoverable } from './Hoverable';

export const Clock = () => {
    const currentTime = useCurrentTime();

    const time = currentTime.toLocaleString(DateTime.TIME_SIMPLE);
    const date = currentTime.toLocaleString(DateTime.DATE_SHORT);
    const fullDate = currentTime.toLocaleString(DateTime.DATETIME_FULL);

    return (
        <Tooltip label={fullDate} className="h-full">
            <Hoverable>
                <div
                    className={`
                        flex h-full flex-col items-center justify-center px-1.5 text-gray-200
                        text-shadow-aero-tint-darkest/50 text-shadow-md
                    `}
                >
                    <p className="z-10 text-xs">{time}</p>
                    <p className="z-10 text-xs">{date}</p>
                </div>
            </Hoverable>
        </Tooltip>
    );
};
