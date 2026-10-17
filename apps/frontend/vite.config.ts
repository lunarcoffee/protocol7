import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const srcRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: { '@': srcRoot },
    },
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        { test: /node_modules\/react-dom/, name: 'react-dom' },
                        { test: /node_modules\/react-markdown/, name: 'react-markdown' },
                        { test: /node_modules\/@zenfs/, name: 'zenfs' },
                        { test: /node_modules\/motion/, name: 'motion' },
                        { test: /node_modules\/luxon/, name: 'luxon' },
                        { test: /node_modules\/file-type/, name: 'file-type' },
                        { test: /node_modules\/mime/, name: 'mime' },
                        { test: /node_modules/, name: 'libs' },
                    ],
                },
            },
        },
    },
});
