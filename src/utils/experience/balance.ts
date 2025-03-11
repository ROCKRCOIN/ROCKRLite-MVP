/**
 * Experience Balance Utilities
 *
 * Utilities for managing X=Y balance in experience auctions.
 * Based on specifications from "Clarification of Specification re Live Experience
 * Multi-Step Process and RKS Allocation"
 *
 * Core concepts:
 * - X side = Attendees (revenue)
 * - Y side = Suppliers (costs: host, curator, venue, production, ai)
 * - X must always equal Y for auction balance
 * - Variables can be locked to prevent automatic adjustment
 */
import type {
  Experience,
  BalanceResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  EnhancedRKSAllocation
} from '../../interfaces/experience/types';

/**
 * Calculates the X and Y side balance for an experience auction
 * X side represents attendees (revenue) while Y side represents suppliers (costs)
 * According to specifications, X must always equal Y for auction balance
 *
 * @param experience - The experience to calculate balance for
 * @returns Balance calculation result with X and Y totals and balance status
 */
export const calculateXYBalance = (experience: Experience): BalanceResult => {
  // Extract values for X side (attendees/revenue)
  const xTotal = calculateXSideTotal(experience);
  // Extract values for Y side (suppliers/costs)
  const yTotal = calculateYSideTotal(experience);
  // Check if there's a balance (X = Y)
  const isBalanced = Math.abs(xTotal - yTotal) < 0.001; // Using small epsilon for float comparison
  // Calculate the difference (used for adjustments)
  const difference = xTotal - yTotal;
  // Determine locked and adjustable variables
  const lockedVariables: string[] = [];
  const adjustableVariables: string[] = [];
  // Check if an enhanced RKS allocation exists with locked variables
  const enhancedRKS = experience.rks as EnhancedRKSAllocation;
  if (enhancedRKS && enhancedRKS.locked) {
    // Extract locked variables
    Object.keys(enhancedRKS.locked).forEach(variable => {
      if (enhancedRKS.locked[variable]) {
        lockedVariables.push(variable);
      } else {
        adjustableVariables.push(variable);
      }
    });
  } else {
    // If no locked variables, all are adjustable
    adjustableVariables.push('attendees', 'host', 'curator', 'venue', 'production', 'ai');
  }
  
  return {
    xTotal,
    yTotal,
    isBalanced,
    difference,
    adjustableVariables,
    lockedVariables,
    adjustments: [], // Will be populated during adjustment operations
    timestamp: Date.now()
  };
};

/**
 * Calculates the total value for the X side (attendees/revenue)
 *
 * @param experience - The experience to calculate X side total for
 * @returns The total X side value
 */
const calculateXSideTotal = (experience: Experience): number => {
  const { capacity, rks } = experience;
  // In MVP, X side is calculated based on the attendees allocation
  // or capacity.target * average bid if enhanced allocation is available
  // Standard calculation
  if (rks && rks.breakdown && rks.breakdown.attendees) {
    return rks.breakdown.attendees;
  }
  // Enhanced calculation with average bid
  const enhancedRKS = rks as EnhancedRKSAllocation;
  if (enhancedRKS?.xSide?.components?.averageBid) {
    const averageBid = enhancedRKS.xSide.components.averageBid;
    const attendeeCount = capacity.target || 0;
    return attendeeCount * averageBid;
  }
  // Default value based on specification (3000 RKS per attendee)
  const defaultBid = 3000;
  const attendeeCount = capacity.target || 0;
  return attendeeCount * defaultBid;
};

/**
 * Calculates the total value for the Y side (suppliers/costs)
 *
 * @param experience - The experience to calculate Y side total for
 * @returns The total Y side value
 */
const calculateYSideTotal = (experience: Experience): number => {
  const { rks } = experience;
  // If no RKS breakdown available, return 0
  if (!rks || !rks.breakdown) {
    return 0;
  }
  // Extract RKS breakdown
  const breakdown = rks.breakdown;
  // Sum all components of the Y side (all supplier costs)
  return (
    (breakdown.host || 0) +
    (breakdown.curator || 0) +
    (breakdown.venue || 0) +
    (breakdown.production || 0) +
    (breakdown.ai || 0)
  );
};

/**
 * Validates if a variable can be locked while maintaining X=Y balance
 * According to specifications, curators can lock variables they don't want auto-adjusted,
 * but there must always be at least one unlocked variable to maintain X=Y
 *
 * @param experience - The experience containing the variable
 * @param variableToLock - The identifier of the variable to lock
 * @returns Validation result with status and messages
 */
export const validateLockingRules = (
  experience: Experience,
  variableToLock: string
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  // Check if enhanced RKS allocation is present
  const enhancedRKS = experience.rks as EnhancedRKSAllocation;
  if (!enhancedRKS || !enhancedRKS.locked) {
    errors.push({
      field: 'rks',
      message: 'RKS allocation does not support variable locking'
    });
    return {
      isValid: false,
      errors,
      warnings
    };
  }
  // Get currently locked variables
  const currentlyLocked = Object.keys(enhancedRKS.locked).filter(key => 
    enhancedRKS.locked[key]
  );
  // Add the new variable to lock
  const wouldBeLocked = [...currentlyLocked];
  if (!wouldBeLocked.includes(variableToLock)) {
    wouldBeLocked.push(variableToLock);
  }
  // Check if too many variables would be locked
  const totalVariables = Object.keys(enhancedRKS.breakdown).length;
  if (wouldBeLocked.length >= totalVariables - 1) {
    errors.push({
      field: variableToLock,
      message: 'Cannot lock all variables; at least one must remain adjustable to maintain X=Y balance'
    });
  }
  // Check if this would lock both X and Y sides completely
  const xSideLocked = variableToLock === 'attendees' || 
                     currentlyLocked.includes('attendees');
  const ySideVariables = ['host', 'curator', 'venue', 'production', 'ai'];
  const ySideLockedCount = ySideVariables.filter(v => 
    wouldBeLocked.includes(v)
  ).length;
  if (xSideLocked && ySideLockedCount >= ySideVariables.length) {
    errors.push({
      field: variableToLock,
      message: 'Cannot lock all variables on both sides (X and Y)'
    });
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Retrieves all variables that can be adjusted to maintain X=Y balance
 *
 * @param experience - The experience to get adjustable variables for
 * @returns Array of variable identifiers that can be adjusted
 */
export const getAdjustableVariables = (experience: Experience): string[] => {
  // Default Y-side components that can be adjusted:
  // host, curator, venue, production, ai
  const ySideVariables = ['host', 'curator', 'venue', 'production', 'ai'];
  // Include X-side (attendees) as potentially adjustable
  const allAdjustable = ['attendees', ...ySideVariables];
  // If there's an enhanced RKS allocation with locked variables,
  // filter out the locked ones
  const enhancedRKS = experience.rks as EnhancedRKSAllocation;
  if (enhancedRKS?.locked) {
    return allAdjustable.filter(variable => !enhancedRKS.locked[variable]);
  }
  return allAdjustable;
};

/**
 * Adjusts variables to maintain X=Y balance
 * When a variable changes, unlocked variables are adjusted proportionally
 * to ensure that the X side (attendees) equals the Y side (suppliers)
 *
 * @param experience - The experience to adjust
 * @param changedVariable - The variable that was changed
 * @param newValue - The new value for the changed variable
 * @returns Updated experience with adjusted values to maintain X=Y balance
 */
export const adjustToMaintainBalance = (
  experience: Experience,
  changedVariable: string,
  newValue: number
): Experience => {
  // Create a deep copy to avoid mutating the original
  const updatedExperience = JSON.parse(JSON.stringify(experience)) as Experience;
  const rks = updatedExperience.rks;
  // Track original values before changes for adjustment history
  const originalValues: Record<string, number> = {};
  if (rks?.breakdown) {
    Object.keys(rks.breakdown).forEach(key => {
      originalValues[key] = (rks.breakdown as Record<string, number>)[key] || 0;
    });
  }
  // Check if this is an X side or Y side variable
  const isXSide = changedVariable === 'attendees';
  // Apply the changed value
  if (rks && rks.breakdown) {
    // Type assertion is safe here as we know the variable exists
    (rks.breakdown as Record<string, number>)[changedVariable] = newValue;
  }
  // Calculate the new balance
  const balance = calculateXYBalance(updatedExperience);
  // If already balanced, return early
  if (balance.isBalanced) {
    return updatedExperience;
  }
  // Get locked variables
  const lockedVariables = balance.lockedVariables || [];
  // Track adjustments
  const adjustments: Array<{
    variable: string;
    oldValue: number;
    newValue: number;
    reason: string;
  }> = [];
  // Add initial change to adjustments
  adjustments.push({
    variable: changedVariable,
    oldValue: originalValues[changedVariable] || 0,
    newValue: newValue,
    reason: 'User edited'
  });
  // Determine which side needs adjustment
  if (isXSide) {
    // X side changed, adjust Y side
    adjustYSide(updatedExperience, balance.xTotal, lockedVariables, adjustments, originalValues);
  } else {
    // Y side changed, adjust X side
    adjustXSide(updatedExperience, balance.yTotal, lockedVariables, adjustments, originalValues);
  }
  
  // Store adjustments in the enhanced RKS allocation if available
  const enhancedRKS = updatedExperience.rks as EnhancedRKSAllocation;
  if (enhancedRKS && typeof enhancedRKS === 'object') {
    // Create xSide and ySide if they don't exist
    if (!enhancedRKS.xSide) {
      enhancedRKS.xSide = {
        total: balance.xTotal,
        components: {
          averageBid: balance.xTotal / (updatedExperience.capacity?.target || 1)
        }
      };
    }
    if (!enhancedRKS.ySide) {
      enhancedRKS.ySide = {
        total: balance.yTotal,
        components: {}
      };
    }
    // Update xSide and ySide totals
    enhancedRKS.xSide.total = balance.xTotal;
    enhancedRKS.ySide.total = balance.yTotal;
    // Update components
    if (rks?.breakdown) {
      if (enhancedRKS.ySide.components) {
        enhancedRKS.ySide.components = {
          ...enhancedRKS.ySide.components,
          host: rks.breakdown.host || 0,
          curator: rks.breakdown.curator || 0,
          venue: rks.breakdown.venue || 0,
          production: rks.breakdown.production || 0,
          ai: rks.breakdown.ai || 0
        };
      }
    }
  }
  return updatedExperience;
};

/**
 * Helper function to adjust Y side variables
 *
 * @param experience - The experience to adjust
 * @param targetTotal - The target Y side total
 * @param lockedVariables - Variables that can't be adjusted
 * @param adjustments - Array to track adjustments
 * @param originalValues - Original values before adjustment
 */
const adjustYSide = (
  experience: Experience,
  targetTotal: number,
  lockedVariables: string[],
  adjustments: Array<{
    variable: string;
    oldValue: number;
    newValue: number;
    reason: string;
  }>,
  originalValues: Record<string, number>
): void => {
  if (!experience.rks || !experience.rks.breakdown) return;
  const breakdown = experience.rks.breakdown;
  const ySideVariables = ['host', 'curator', 'venue', 'production', 'ai'];
  // Filter out locked variables
  const adjustableVariables = ySideVariables.filter(v => !lockedVariables.includes(v));
  if (adjustableVariables.length === 0) return;
  // Calculate current Y total for unlocked variables
  let currentUnlockedTotal = 0;
  for (const variable of adjustableVariables) {
    currentUnlockedTotal += (breakdown as Record<string, number>)[variable] || 0;
  }
  // Calculate locked Y total
  let lockedTotal = 0;
  for (const variable of ySideVariables) {
    if (lockedVariables.includes(variable)) {
      lockedTotal += (breakdown as Record<string, number>)[variable] || 0;
    }
  }
  // Calculate how much to distribute
  const targetUnlockedTotal = targetTotal - lockedTotal;
  // If nothing to distribute or negative amount, return
  if (targetUnlockedTotal <= 0 || currentUnlockedTotal <= 0) return;
  // Calculate adjustment ratio
  const ratio = targetUnlockedTotal / currentUnlockedTotal;
  // Apply adjustments
  for (const variable of adjustableVariables) {
    const currentValue = (breakdown as Record<string, number>)[variable] || 0;
    const newValue = Math.round(currentValue * ratio);
    (breakdown as Record<string, number>)[variable] = newValue;
    // Track adjustment
    adjustments.push({
      variable,
      oldValue: originalValues[variable] || 0,
      newValue,
      reason: 'Automatic Y-side adjustment to maintain X=Y balance'
    });
  }
};

/**
 * Helper function to adjust X side variables
 *
 * @param experience - The experience to adjust
 * @param targetTotal - The target X side total
 * @param lockedVariables - Variables that can't be adjusted
 * @param adjustments - Array to track adjustments
 * @param originalValues - Original values before adjustment
 */
const adjustXSide = (
  experience: Experience,
  targetTotal: number,
  lockedVariables: string[],
  adjustments: Array<{
    variable: string;
    oldValue: number;
    newValue: number;
    reason: string;
  }>,
  originalValues: Record<string, number>
): void => {
  if (!experience.rks || !experience.rks.breakdown) return;
  // If attendees is locked, we can't adjust
  if (lockedVariables.includes('attendees')) return;
  // Track the original value
  const originalValue = experience.rks.breakdown.attendees || 0;
  // Just set attendees to match Y total
  (experience.rks.breakdown as Record<string, number>)['attendees'] = targetTotal;
  // Track adjustment
  adjustments.push({
    variable: 'attendees',
    oldValue: originalValue,
    newValue: targetTotal,
    reason: 'Automatic X-side adjustment to maintain X=Y balance'
  });
};

/**
 * Reset a variable to its default value
 *
 * @param experience - The experience to modify
 * @param variable - The variable to reset
 * @param defaultExperience - The default experience with original values
 * @returns Updated experience with the variable reset
 */
export const resetVariableToDefault = (
  experience: Experience,
  variable: string,
  defaultExperience: Experience
): Experience => {
  // Create a deep copy to avoid mutating the original
  const updatedExperience = JSON.parse(JSON.stringify(experience)) as Experience;
  if (!updatedExperience.rks || !updatedExperience.rks.breakdown || 
      !defaultExperience.rks || !defaultExperience.rks.breakdown) {
    return updatedExperience;
  }
  // Get the current value before resetting
  const currentValue = (updatedExperience.rks.breakdown as Record<string, number>)[variable] || 0;
  // Set the variable back to its default value
  if (Object.keys(defaultExperience.rks.breakdown).includes(variable)) {
    const defaultValue = (defaultExperience.rks.breakdown as Record<string, number>)[variable];
    (updatedExperience.rks.breakdown as Record<string, number>)[variable] = defaultValue;
    // If this is an EnhancedRKSAllocation, track the reset
    const enhancedRKS = updatedExperience.rks as EnhancedRKSAllocation;
    if (enhancedRKS && typeof enhancedRKS.resetToDefault === 'function') {
      enhancedRKS.resetToDefault(variable);
    }
  }
  // Re-balance after resetting
  return adjustToMaintainBalance(
    updatedExperience,
    variable,
    (updatedExperience.rks.breakdown as Record<string, number>)[variable]
  );
};

/**
 * Calculate RKS mining amount based on capacity
 *
 * @param experience - The experience to calculate mining for
 * @returns The calculated mining amount
 */
export const calculateRKSMining = (experience: Experience): number => {
  if (!experience.capacity || !experience.capacity.target) {
    return 0;
  }
  // Base calculation from specs: target capacity * 100
  const baseAmount = experience.capacity.target * 100;
  // Mining is 80% of the base amount
  return Math.floor(baseAmount * 0.8);
};