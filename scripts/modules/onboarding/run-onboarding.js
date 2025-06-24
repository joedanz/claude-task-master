#!/usr/bin/env node

/**
 * Run the Task Master onboarding
 */

import { startOnboarding } from './index.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

if (args.includes('--reset')) {
    options.reset = true;
}

if (args.includes('--help') || args.includes('-h')) {
    console.log('Task Master Onboarding');
    console.log('');
    console.log('Usage: node scripts/modules/onboarding/run-onboarding.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --reset    Reset onboarding state and start fresh');
    console.log('  --help     Show this help message');
    process.exit(0);
}

// Start onboarding
startOnboarding(options).catch(error => {
    console.error('Onboarding error:', error);
    process.exit(1);
}); 