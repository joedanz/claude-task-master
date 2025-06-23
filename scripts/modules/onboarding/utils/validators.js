/**
 * @file Input validation helpers for CLI onboarding.
 */

/**
 * Validates if a value is present and not empty.
 * @param {string} value - The input value.
 * @returns {string|true} An error message if invalid, otherwise true.
 */
export const isRequired = (value) => {
  if (value && value.trim().length > 0) {
    return true;
  }
  return 'This field is required.';
};

/**
 * Validates a project name (alphanumeric, hyphens, underscores).
 * @param {string} value - The input value.
 * @returns {string|true} An error message if invalid, otherwise true.
 */
export const isValidProjectName = (value) => {
  if (!value) return 'Project name is required.';
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    return 'Project name can only contain letters, numbers, hyphens, and underscores.';
  }
  return true;
};

/**
 * Validates a semantic version string.
 * @param {string} value - The input value.
 * @returns {string|true} An error message if invalid, otherwise true.
 */
export const isValidVersion = (value) => {
  if (!value) return true; // Version is optional
  if (!/^\d+\.\d+\.\d+$/.test(value)) {
    return 'Version must be in format x.y.z (e.g., 1.0.0).';
  }
  return true;
}; 