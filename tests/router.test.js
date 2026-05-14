// tests/router.test.js
import { createRouter } from '../packages/simplijs/src/router.js';

console.log('Testing Router Params...');

let capturedParams = null;
const routes = {
  '/user/:id': (params) => {
    capturedParams = params;
    return `User ${params.id}`;
  },
  '/post/:category/:id': (params) => {
    capturedParams = params;
    return `Post ${params.id} in ${params.category}`;
  }
};

const router = createRouter(routes, { root: document.createElement('div'), mode: 'hash' });

// Mock hash change and manual call to handleRoute (since we are in node/mock environment)
async function testRoute(path, expectedParams) {
    window.location.hash = '#' + path;
    // We need to trigger handleRoute manually in mock env if hashchange listener doesn't fire as expected
    // But createRouter already attaches it. Let's see if we can trigger it.
    const event = new Event('hashchange');
    window.dispatchEvent(event);
    
    // Give it a tick for async handlers
    await new Promise(r => setTimeout(r, 10));
    
    if (JSON.stringify(capturedParams) === JSON.stringify(expectedParams)) {
        console.log(`✅ Router Param Test Passed for ${path}`);
    } else {
        console.error(`❌ Router Param Test Failed for ${path}`);
        console.error(`Expected:`, expectedParams);
        console.error(`Received:`, capturedParams);
        process.exit(1);
    }
}

async function run() {
    await testRoute('/user/123', { id: '123' });
    await testRoute('/post/tech/simplijs', { category: 'tech', id: 'simplijs' });
    console.log('  - Router Params: OK');
}

run();
