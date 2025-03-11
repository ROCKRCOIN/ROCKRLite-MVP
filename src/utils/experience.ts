/**
 * Experience Utility Functions
 * 
 * Re-exports all functionality from the modular experience utilities.
 * This file provides backward compatibility with existing code that
 * may import directly from utils/experience.ts
 * 
 * For new code, it's recommended to import from utils/experience/index.ts
 * or the specific module for better code organization.
 */

// Re-export all functions from the modular implementation
export * from './experience/index';