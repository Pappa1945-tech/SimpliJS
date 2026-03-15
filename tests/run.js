// tests/run.js
import './mock.js'; // MUST BE FIRST

async function runTests() {
  console.log('🚀 Starting SimpliJS Test Suite...\n');
  
  try {
    await import('./reactive.test.js');
    await import('./renderer.test.js');
    await import('./component.test.js');
    await import('./form.test.js');
    await import('./async.test.js');
    
    console.log('\nAll tests passed successfully! 🚀');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:');
    console.error(err);
    process.exit(1);
  }
}

runTests();
