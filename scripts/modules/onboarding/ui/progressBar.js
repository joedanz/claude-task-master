/**
 * Progress bar wrapper for onboarding
 */

import cliProgress from 'cli-progress';
import chalk from 'chalk';
import gradient from 'gradient-string';

let progressBar = null;

/**
 * Create and start a progress bar
 */
export function createProgressBar(total, initial = 0) {
    // Stop existing bar if any
    if (progressBar) {
        progressBar.stop();
    }
    
    // Create new progress bar with custom format
    progressBar = new cliProgress.SingleBar({
        format: ' {bar} {percentage}% | {value}/{total} sections',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true,
        barsize: 30,
        clearOnComplete: false,
        stopOnComplete: false,
        formatBar: (progress, options) => {
            const completeSize = Math.round(progress * options.barsize);
            const incompleteSize = options.barsize - completeSize;
            
            // Create gradient effect for completed portion
            const completeBar = gradient.rainbow(options.barCompleteChar.repeat(completeSize));
            const incompleteBar = chalk.gray(options.barIncompleteChar.repeat(incompleteSize));
            
            return completeBar + incompleteBar;
        }
    }, cliProgress.Presets.shades_classic);
    
    // Start the bar
    progressBar.start(total, initial, {
        label: 'Onboarding Progress'
    });
    
    return progressBar;
}

/**
 * Update progress bar
 */
export function updateProgress(value, label = 'Onboarding Progress') {
    if (progressBar) {
        progressBar.update(value, { label });
    }
}

/**
 * Stop and clear progress bar
 */
export function stopProgress() {
    if (progressBar) {
        progressBar.stop();
        progressBar = null;
    }
}

/**
 * Ensure progress bar is stopped on exit
 */
process.on('exit', stopProgress);
process.on('SIGINT', () => {
    stopProgress();
    process.exit(0);
});
process.on('SIGTERM', () => {
    stopProgress();
    process.exit(0);
});

export function createFancyProgressBar() {
    const bar = new cliProgress.SingleBar({
        format: `${chalk.cyan('Progress')} |{bar}| {percentage}% | ${chalk.yellow('{value}/{total}')} ${chalk.green('sections completed')}`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
        barsize: 40,
        clearOnComplete: false,
        stopOnComplete: false,
        formatBar: (progress, options) => {
            const completeSize = Math.round(progress * options.barsize);
            const incompleteSize = options.barsize - completeSize;
            
            // Create multi-color gradient
            const colors = ['#FF0080', '#FF8C00', '#FFD700', '#00CED1', '#9370DB'];
            let completeBar = '';
            
            for (let i = 0; i < completeSize; i++) {
                const colorIndex = Math.floor((i / completeSize) * colors.length);
                completeBar += chalk.hex(colors[colorIndex])(options.barCompleteChar);
            }
            
            const incompleteBar = chalk.gray(options.barIncompleteChar.repeat(incompleteSize));
            
            return completeBar + incompleteBar;
        }
    }, cliProgress.Presets.shades_classic);
    
    return bar;
}

// Export aliases for consistency
export const updateProgressBar = updateProgress;
export const closeProgressBar = stopProgress; 