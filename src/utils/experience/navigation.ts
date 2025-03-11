/**
 * Experience Navigation Utilities
 * 
 * Utilities for managing navigation through the multi-step experience creation process:
 * - Step navigation validation
 * - Step transition management
 * - Step progress tracking
 * 
 * Based on "Revised Multi-Step Process" specification
 */
import type { 
    ExperienceStep, 
    ValidationResult, 
    StepValidation 
  } from '../../interfaces/experience/types';
  
  /**
   * Returns the next valid step the user can navigate to
   *
   * @param currentStep - The current step
   * @param validation - Validation state for all steps
   * @param totalSteps - Total number of steps
   * @returns The next valid step or null if no valid step found
   */
  export const getNextValidStep = (
    currentStep: ExperienceStep,
    validation: Record<ExperienceStep, boolean>,
    totalSteps: ExperienceStep
  ): ExperienceStep | null => {
    // Check if we're already at the last step
    if (currentStep >= totalSteps) {
      return null;
    }
    
    // First check if we can go to the immediate next step
    if (validation[currentStep]) {
      return (currentStep + 1) as ExperienceStep;
    }
    
    // Otherwise, look for any valid step after the current one
    for (let stepNum = currentStep + 1; stepNum <= totalSteps; stepNum++) {
      const step = stepNum as ExperienceStep;
      if (validation[step]) {
        return step;
      }
    }
    
    // If no valid next step found
    return null;
  };
  
  /**
   * Returns the previous step the user can navigate to
   *
   * @param currentStep - The current step
   * @returns The previous step or null if already at first step
   */
  export const getPreviousStep = (currentStep: ExperienceStep): ExperienceStep | null => {
    if (currentStep <= 1) {
      return null;
    }
    
    return (currentStep - 1) as ExperienceStep;
  };
  
  /**
   * Returns the step progress percentage
   *
   * @param currentStep - The current step
   * @param totalSteps - Total number of steps
   * @returns Progress percentage (0-100)
   */
  export const calculateStepProgress = (
    currentStep: ExperienceStep,
    totalSteps: ExperienceStep
  ): number => {
    return Math.floor((currentStep / totalSteps) * 100);
  };
  
  /**
   * Gets a map of required previous steps for each step
   * Used to determine dependencies between steps
   *
   * @returns Mapping of each step to its required previous steps
   */
  export const getStepDependencies = (): Record<ExperienceStep, ExperienceStep[]> => {
    // Define step dependencies based on the specification
    return {
      1: [], // Step 1 has no prerequisites
      2: [1], // Step 2 requires Step 1
      3: [1, 2], // Step 3 requires Steps 1 and 2
      4: [1, 2, 3], // Step 4 requires Steps 1, 2, and 3
      5: [1, 2, 3, 4], // Step 5 requires Steps 1, 2, 3, and 4
      6: [1, 2, 3, 4, 5], // Step 6 requires Steps 1, 2, 3, 4, and 5
      7: [1, 2, 3, 4, 5, 6], // Step 7 requires Steps 1, 2, 3, 4, 5, and 6
      8: [1, 2, 3, 4, 5, 6, 7], // Step 8 requires Steps 1, 2, 3, 4, 5, 6, and 7
      9: [1, 2, 3, 4, 5, 6, 7, 8] // Step 9 requires all previous steps
    };
  };
  
  /**
   * Returns a list of all step names in order
   *
   * @returns Array of step names
   */
  export const getAllStepNames = (): string[] => {
    return [
      'Template Selection',
      'Basic Details',
      'Host Selection',
      'Venue Selection',
      'Participants',
      'Calendar and Mining',
      'Authentication',
      'Media',
      'Review and Publish'
    ];
  };
  
  /**
   * Returns a description for each step
   *
   * @param step - The step number
   * @returns The step description
   */
  export const getStepDescription = (step: ExperienceStep): string => {
    const stepDescriptions: Record<ExperienceStep, string> = {
      1: 'Select a template for your experience',
      2: 'Enter subject, genre, and basic details',
      3: 'Select who will host this experience',
      4: 'Choose a venue for your experience',
      5: 'Configure participant capacity',
      6: 'Schedule and set up RKS mining',
      7: 'Configure authentication requirements',
      8: 'Upload media for your experience',
      9: 'Review all details and publish'
    };
    
    return stepDescriptions[step] || '';
  };
  
  /**
   * Creates a mapping for default step validation state
   * 
   * @returns Record with default validation state for each step
   */
  export const getDefaultStepValidation = (): Record<ExperienceStep, boolean> => {
    return {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false
    };
  };
  
  /**
   * Handles navigation between steps, including validation and state updates
   *
   * @param fromStep - Current step
   * @param toStep - Target step
   * @param validation - Current validation state
   * @param saveState - Function to save current state
   * @returns Whether navigation was successful
   */
  export const handleStepNavigation = async (
    fromStep: ExperienceStep,
    toStep: ExperienceStep,
    validation: Record<ExperienceStep, boolean>,
    saveState: () => Promise<void>
  ): Promise<boolean> => {
    // Always allow going back to previous steps
    if (toStep < fromStep) {
      // Save current step state before navigating
      await saveState();
      return true;
    }
    
    // Check if current step is validated
    if (!validation[fromStep]) {
      // Cannot proceed if current step is not valid
      return false;
    }
    
    // Save state before proceeding
    await saveState();
    return true;
  };