/**
 * Experience Validation Utilities
 * 
 * Utilities for validating various aspects of experiences:
 * - Basic experience validation
 * - Domain-specific validation
 * - UIMA eligibility checking
 * - Time slot validation
 * - Step-specific validation
 */
import type {
  Experience,
  ExperienceType,
  ExperienceSetting,
  ExperienceStep,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TimeSlot,
  StepValidation
} from '../../interfaces/experience/types';
import type { Domain } from '../../interfaces/domain/types';

/**
 * Validates an experience object
 * 
 * @param experience - The experience to validate
 * @returns Validation result with errors and warnings
 */
export const validateExperience = (experience: Partial<Experience>): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (!experience.type) {
    errors.push({
      field: 'type',
      message: 'Experience type is required'
    });
  }
  
  if (!experience.setting) {
    errors.push({
      field: 'setting',
      message: 'Experience setting is required'
    });
  }
  
  if (!experience.capacity || experience.capacity.min <= 0) {
    errors.push({
      field: 'capacity',
      message: 'Valid capacity is required'
    });
  } else if (experience.capacity.min > experience.capacity.target) {
    warnings.push({
      field: 'capacity',
      message: 'Minimum capacity exceeds target capacity'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates if an experience meets the domain-specific requirements
 * Rules include domain restrictions on experience types, settings, capacity, etc.
 *
 * @param experience - The experience to validate
 * @param domain - The domain to validate against
 * @returns Validation result with status and messages
 */
export const validateDomainExperience = (
  experience: Experience,
  domain: Domain
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Validate experience type based on domain restrictions
  if (domain.config?.eligibleExperienceTypes &&
      !domain.config.eligibleExperienceTypes.includes(experience.type)) {
    errors.push({
      field: 'type',
      message: `Experience type "${experience.type}" is not allowed in domain "${domain.name}"`
    });
  }
  
  // Validate experience setting based on domain restrictions
  if (domain.config?.eligibleExperienceSettings &&
      !domain.config.eligibleExperienceSettings.includes(experience.setting)) {
    errors.push({
      field: 'setting',
      message: `Experience setting "${experience.setting}" is not allowed in domain "${domain.name}"`
    });
  }
  
  // Validate capacity based on domain restrictions
  if (domain.config?.experience?.maxCapacity &&
      experience.capacity.max > domain.config.experience.maxCapacity) {
    errors.push({
      field: 'capacity.max',
      message: `Maximum capacity exceeds domain limit of ${domain.config.experience.maxCapacity}`
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Checks if an experience is eligible for UIMA account funding
 * Based on the specifications from "Clarification of Specification re Live Experience
 * Multi-Step Process and RKS Allocation"
 *
 * @param experience - The experience to check eligibility for
 * @param eligibilityList - List of eligible experience types, settings, subjects and genres
 * @returns Whether the experience is eligible and the reason
 */
export const checkUIMAEligibility = (
  experience: Experience,
  eligibilityList?: {
    types: ExperienceType[];
    settings: ExperienceSetting[];
    subjects: string[];
    genres: string[];
  }
): { isEligible: boolean; reason?: string } => {
  // Default eligibility criteria if not provided
  const criteria = eligibilityList || {
    types: ['lecture', 'workshop', 'seminar'] as ExperienceType[],
    settings: ['academic', 'professional'] as ExperienceSetting[],
    subjects: [],
    genres: []
  };
  
  // Check if experience type is eligible
  if (!criteria.types.includes(experience.type)) {
    return {
      isEligible: false,
      reason: `Experience type "${experience.type}" is not eligible for UIMA funding`
    };
  }
  
  // Check if experience setting is eligible
  if (!criteria.settings.includes(experience.setting)) {
    return {
      isEligible: false,
      reason: `Experience setting "${experience.setting}" is not eligible for UIMA funding`
    };
  }
  
  // Check if subject is eligible (if provided)
  if (experience.subject && 
      criteria.subjects.length > 0 && 
      !criteria.subjects.includes(experience.subject)) {
    return {
      isEligible: false,
      reason: `Subject "${experience.subject}" is not eligible for UIMA funding`
    };
  }
  
  // Check if genre is eligible (if provided)
  if (experience.genre && 
      criteria.genres.length > 0 && 
      !criteria.genres.includes(experience.genre)) {
    return {
      isEligible: false,
      reason: `Genre "${experience.genre}" is not eligible for UIMA funding`
    };
  }
  
  // If all checks pass, experience is eligible
  return { isEligible: true };
};

/**
 * Validates a timeSlot
 *
 * @param slot - The time slot to validate
 * @returns Validation result with errors and warnings
 */
export const validateTimeSlot = (slot: { start: Date; end: Date }): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check if start and end are valid dates
  if (!(slot.start instanceof Date) || isNaN(slot.start.getTime())) {
    errors.push({
      field: 'start',
      message: 'Start time must be a valid date'
    });
  }
  
  if (!(slot.end instanceof Date) || isNaN(slot.end.getTime())) {
    errors.push({
      field: 'end',
      message: 'End time must be a valid date'
    });
  }
  
  // Check if end is after start
  if (
    slot.start instanceof Date && 
    slot.end instanceof Date && 
    slot.start >= slot.end
  ) {
    errors.push({
      field: 'end',
      message: 'End time must be after start time'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates that an experience has the required fields for a specific step
 *
 * @param experience - The experience to validate
 * @param step - The step number to validate for
 * @returns Validation result with status and messages
 */
export const validateStep = (
  experience: Experience, 
  step: ExperienceStep
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Step-specific validation logic
  switch (step) {
    case 1: // Template Selection
      if (!experience.type) {
        errors.push({ field: 'type', message: 'Experience type is required' });
      }
      if (!experience.setting) {
        errors.push({ field: 'setting', message: 'Experience setting is required' });
      }
      if (!experience.capacity || !experience.capacity.target) {
        errors.push({ field: 'capacity.target', message: 'Target capacity is required' });
      }
      break;
      
    case 2: // Basic Details
      if (!experience.subject) {
        errors.push({ field: 'subject', message: 'Subject is required' });
      }
      if (!experience.genre) {
        errors.push({ field: 'genre', message: 'Genre is required' });
      }
      break;
      
    case 3: // Host Section
      // Host validation will be implemented based on specifications
      if (!experience.rks?.breakdown?.host) {
        errors.push({ field: 'rks.breakdown.host', message: 'Host allocation is required' });
      }
      break;
      
    case 4: // Venue Selection
      if (!experience.location?.venue) {
        errors.push({ field: 'location.venue', message: 'Venue is required' });
      }
      break;
      
    case 5: // Participants Section
      if (!experience.capacity) {
        errors.push({ field: 'capacity', message: 'Capacity configuration is required' });
      }
      break;
      
    case 6: // Calendar and Mining
      if (!experience.schedule || !experience.schedule.slots || experience.schedule.slots.length === 0) {
        errors.push({ field: 'schedule.slots', message: 'At least one time slot is required' });
      }
      break;
      
    case 7: // Authentication Section
      // Authentication validation will be implemented based on specifications
      break;
      
    case 8: // Media Section
      // Media validation will be implemented based on specifications
      break;
      
    case 9: // Review and Publish
      // All previous validations must pass
      // Check if we have core data required for auction
      if (!experience.rks || !experience.rks.total) {
        errors.push({ field: 'rks.total', message: 'RKS allocation is required for auction' });
      }
      break;
      
    default:
      errors.push({ field: 'step', message: `Invalid step number: ${step}` });
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates all steps of an experience
 * 
 * @param experience - The experience to validate
 * @returns Validation results for each step
 */
export const validateAllSteps = (
  experience: Experience
): Record<ExperienceStep, StepValidation> => {
  const steps: ExperienceStep[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const result: Partial<Record<ExperienceStep, StepValidation>> = {};
  
  steps.forEach(step => {
    const validation = validateStep(experience, step);
    result[step] = {
      step,
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      lastValidated: Date.now()
    };
  });
  
  return result as Record<ExperienceStep, StepValidation>;
};

/**
 * Gets the step name for a given step number
 * 
 * @param step - The step number
 * @returns The name of the step
 */
export const getStepName = (step: ExperienceStep): string => {
  const stepNames: Record<ExperienceStep, string> = {
    1: 'Template Selection',
    2: 'Basic Details',
    3: 'Host Selection',
    4: 'Venue Selection',
    5: 'Participants',
    6: 'Calendar and Mining',
    7: 'Authentication',
    8: 'Media',
    9: 'Review and Publish'
  };
  
  return stepNames[step];
};

/**
 * Determines if navigation to a specific step is allowed
 * based on the current validation state
 * 
 * @param fromStep - Current step
 * @param toStep - Target step
 * @param stepValidation - Validation state for each step
 * @returns Whether navigation is allowed
 */
export const canNavigateToStep = (
  fromStep: ExperienceStep,
  toStep: ExperienceStep,
  stepValidation: Record<ExperienceStep, boolean>
): boolean => {
  // Always allow going back to previous steps
  if (toStep < fromStep) {
    return true;
  }
  
  // For moving forward, ensure current step is validated
  if (toStep > fromStep && !stepValidation[fromStep]) {
    return false;
  }
  
  // Ensure all previous steps are validated
  for (let step = 1 as ExperienceStep; step < toStep; step++) {
    if (!stepValidation[step]) {
      return false;
    }
  }
  
  // If all checks pass, navigation is allowed
  return true;
};