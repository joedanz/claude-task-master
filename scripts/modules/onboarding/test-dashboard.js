#!/usr/bin/env node

/**
 * Test the enhanced dashboard
 */

console.log('Starting dashboard test...');

import { showDashboard } from './dashboard.js';

console.log('Imports loaded, running dashboard...');

// Run the dashboard
showDashboard()
    .then(() => {
        console.log('Dashboard completed successfully');
    })
    .catch(error => {
        console.error('Dashboard error:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }); 