/**
 * Section runner for onboarding
 */

import { runProjectInfoSection } from './project-info.js';
import { runAIProviderSection } from './ai-provider.js';
import { runAPIKeysSection } from './api-keys.js';
import { runFeaturesSection } from './features.js';
import { runRulesSection } from './rules.js';
import { runReviewExecuteSection } from './review-execute.js';

/**
 * Run a specific section
 * @param {string} sectionName - Name of the section to run
 * @returns {Promise<void>}
 */
export async function runSection(sectionName) {
    switch (sectionName) {
        case 'project-info':
            await runProjectInfoSection();
            break;
        case 'ai-provider':
            await runAIProviderSection();
            break;
        case 'api-keys':
            await runAPIKeysSection();
            break;
        case 'features':
            await runFeaturesSection();
            break;
        case 'rules':
            await runRulesSection();
            break;
        case 'review-execute':
            await runReviewExecuteSection();
            break;
        default:
            throw new Error(`Unknown section: ${sectionName}`);
    }
} 