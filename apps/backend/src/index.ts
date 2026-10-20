import { serve } from '@hono/node-server';
import { watch } from 'chokidar';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import path from 'path';

import { config } from './config.js';
import { getFile, invalidateCachedFile } from './hosts/file.js';
import { getManifest, regenerateManifest } from './hosts/manifest.js';
import { logger } from './logger.js';

const app = new Hono();

app.use('/hosts/*', cors({ origin: config.FRONTEND_ORIGIN, maxAge: 3_600 }));

app.get('/hosts/:hostPath{.+}', async (c) => {
    const { hostPath } = c.req.param();
    const [host, ...filePath] = hostPath.split('/').filter((segment) => segment.length > 0);

    // serve the contents of a specific file
    if (filePath.length > 0) {
        const [data, mimeType] = await getFile(host, path.join(...filePath));

        if (config.CACHE_RESPONSES) c.header('Cache-Control', 'max-age=1800');
        c.header('Content-Type', mimeType);
        return c.body(data);
    }

    // serve the filesystem manifest for the given `host`
    let manifest = await getManifest(host);
    return c.json(manifest);
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
