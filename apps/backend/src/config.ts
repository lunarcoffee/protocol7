import dotenv from 'dotenv';
import path from 'path';

import { logger } from './logger.js';

const result = dotenv.config({
    path: ['.env.local', '.env.production'],
    fast: true,
});

if (result.error) {
    logger.fatal({ error: result.error }, 'failed to load .env!');
    process.exit(1);
}

// we more or less assume that if the .env loads fine, all the required values are defined and well-formed
export const config = {
    LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',

    BACKEND_PORT: parseInt(process.env.BACKEND_PORT ?? '8000'),
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN!,

    HOST_ASSETS_PATH: path.join(import.meta.dirname, '..', process.env.HOST_ASSETS_PATH!),
    // in bytes
    HOST_ASSETS_CACHE_SIZE: parseInt(process.env.MAX_ASSET_CACHE_SIZE ?? '100000000'),
};

logger.level = config.LOG_LEVEL;
