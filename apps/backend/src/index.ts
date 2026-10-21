import { serve } from '@hono/node-server';
import { watch } from 'chokidar';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';

import { config } from './config.js';
import { getFile, invalidateCachedFile } from './hosts/file.js';
import { getManifest, regenerateManifest } from './hosts/manifest.js';
import { logger } from './logger.js';

const app = new Hono();

app.use(compress());

app.use('/hosts/*', cors({ origin: config.FRONTEND_ORIGIN, maxAge: 3_600 }));

app.get('/hosts/:host', async (c) => c.json(await getManifest(c.req.param('host'))));

app.get('/hosts/:host/file', async (c) => {
    const filePath = c.req.query('path');
    if (!filePath) return c.notFound();

    const [data, mimeType] = await getFile(c.req.param('host'), filePath);

    if (config.CACHE_RESPONSES) c.header('Cache-Control', 'max-age=1800');
    c.header('Content-Type', mimeType);
    return c.body(data);
});

serve({ fetch: app.fetch, port: config.BACKEND_PORT }, ({ port }) =>
    logger.info(`server is listening on port ${port}`),
);

const HOST_ASSETS_PATH_REGEX = new RegExp(`^${config.HOST_ASSETS_PATH}/`);

// watch host assets directory for any changes (recursively) and refresh caches as needed
watch(config.HOST_ASSETS_PATH, { ignoreInitial: true }).on('all', async (_, eventPath) => {
    const host = eventPath.replace(HOST_ASSETS_PATH_REGEX, '').split('/').at(0);
    if (host) {
        invalidateCachedFile(eventPath);
        await regenerateManifest(host);
    }
});
