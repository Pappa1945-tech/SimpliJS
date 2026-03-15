/**
 * SimpliJS SSG Configuration for SEO Blog
 */
import { useHead } from './src/seo.js';

export default {
    entryFile: 'examples/seo-blog/index.html',
    outDir: 'dist/seo-blog',
    routes: {
        '/': () => {
            useHead({
                title: 'SimpliJS SEO Blog - Home',
                meta: [{ name: 'description', content: 'A high-perf blog build with SimpliJS SSG' }]
            });
            return `<h1>Welcome to SimpliBlog</h1><p>Rendered via SSG</p>`;
        },
        '/about': () => {
            useHead({ title: 'About SimpliJS SSG' });
            return `<h1>About</h1><p>Static pre-rendered page</p>`;
        }
    },
    include: ['dist', 'src']
};
