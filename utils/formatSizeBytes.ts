const UNITS = [
    { limit: 1_000_000_000_000_000, unit: 'PB' },
    { limit: 1_000_000_000_000, unit: 'TB' },
    { limit: 1_000_000_000, unit: 'GB' },
    { limit: 1_000_000, unit: 'MB' },
    { limit: 1_000, unit: 'KB' },
];

export const formatSizeBytes = (bytes: number): string => {
    if (bytes < 1_000) return `${bytes} B`;

    const { limit, unit } = UNITS.find(({ limit }) => bytes >= limit)!;
    return `${(bytes / limit).toFixed(2)} ${unit}`;
};
