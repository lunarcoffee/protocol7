import { serve } from '@hono/node-server';
import { watch } from 'chokidar';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { getFileContents } from './contents.js';
import { getManifest, regenerateManifest } from './manifest.js';
import { HOST_ASSETS_PATH } from './utils.js';

const HOST_ASSETS_PATH_REGEX = new RegExp(`^${HOST_ASSETS_PATH}/`);

// watch host assets directory for any changes (recursively) and regenerate manifests as needed
watch(HOST_ASSETS_PATH, { ignoreInitial: true }).on('all', async (_, eventPath) => {
    const host = eventPath.replace(HOST_ASSETS_PATH_REGEX, '').split('/').at(0);
    if (host) await regenerateManifest(host);
});

const app = new Hono();

// TODO: env
app.use('/hosts/*', cors());

app.get('/hosts/:hostPath{.+}', async (c) => {
    const { hostPath } = c.req.param();
    const [host, ...filePath] = hostPath.split('/').filter((segment) => segment.length > 0);

    // serve the contents of a specific file
    if (filePath.length > 0) {
        const [data, mimeType] = await getFileContents(host, filePath);
        c.header('Content-Type', mimeType);
        return c.body(data);
    }

    // serve the filesystem manifest for the given `host`
    let manifest = await getManifest(host);
    return c.json(manifest);
});

// TODO: env
serve({ fetch: app.fetch, port: 8000 }, (info) => console.log(`server is up on localhost:${info.port}`));
