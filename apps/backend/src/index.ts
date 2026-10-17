import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import path from 'path';

import { generateManifest } from './generateManifest.js';
import { getFile } from './getFile.js';
import { HOST_ASSETS_PATH } from './utils.js';

const app = new Hono();

// TODO: env
app.use('/hosts/*', cors());

app.get('/hosts/:hostPath{.+}', async (c) => {
    const { hostPath } = c.req.param();
    const [host, ...filePath] = hostPath.split('/').filter((segment) => segment.length > 0);

    if (filePath.length > 0) {
        const [data, mimeType] = await getFile(host, filePath);
        c.header('Content-Type', mimeType);
        return c.body(data);
    }

    // TODO: now that this is just running on a server consider watching the actual fs for changes adn regenerating the
    // manifest only then (serving a cached version otherwise)
    const fileRoot = path.join(HOST_ASSETS_PATH, host);
    const entries = await generateManifest(fileRoot, '/');

    return c.json(entries);
});

// TODO: env
serve({ fetch: app.fetch, port: 8000 }, (info) => console.log(`server is up on localhost:${info.port}`));
