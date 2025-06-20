// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './index.js', // make sure this file exports properly
            name: 'chaoschart',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
            external: [], // You can put things like 'react', 'd3', etc. if you want to exclude them
            output: {
                globals: {
                    // Define globals for UMD if needed
                    // react: 'React'
                }
            }
        }
    }
});
