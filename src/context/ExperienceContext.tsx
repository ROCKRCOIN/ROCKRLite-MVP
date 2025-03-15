// src/context/ExperienceContext.tsx
import React, { createContext, useReducer, useRef, useEffect } from 'react';
import type {
  Experience,
  ExperienceState,
  ExperienceAction,
  ExperienceContextValue,
  ValidationResult,
  ExperienceTemplate,
  BalanceResult
} from '../interfaces/experience/types';

const initialState: ExperienceState = {
  // Added step data properties
  step1: {
    experienceType: 'educational',
    experienceSetting: 'Tutorial',
    capacity: '2',
    hostCount: '1',
    country: 'uk',
    city: 'oxford',
  },
  step2: {
    title: '',
    description: '',
    subject: '',
    subjectLevel: '',
    genre: '',
    resources: []
  },
  currentStep: 0,
  data: {},
  isDraft: true,
  validation: {
    errors: [],
    warnings: [],
    lastChecked: 0,
    isValid: false
  },
  loading: false,
  error: null,
  evolution: {
    version: {
      major: 1,
      minor: 0,
      patch: 0,
      timestamp: Date.now()
    },
    features: []
  },
  // Add new step tracking state
  steps: {
    currentStep: 1,
    totalSteps: 9,
    stepValidation: {
      1: true,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false
    },
    canNavigate: (toStep) => true // Simplified implementation
  },
  // Add template tracking state
  template: {
    id: '',
    source: 'default',
    isCustomized: false,
    resetToTemplate: () => {} // Placeholder, real implementation in the provider
  },
  // Add X=Y balance state
  balance: {
    xTotal: 0,
    yTotal: 0,
    isBalanced: true,
    lockedVariables: []
  }
};

export const ExperienceContext = createContext<ExperienceContextValue | undefined>(undefined);

function experienceReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  switch (action.type) {
    case 'UPDATE_STEP':
      return {
        ...state,
        currentStep: action.step,
        data: {
          ...state.data,
          ...action.data
        }
      };
    case 'SAVE_DRAFT':
      return {
        ...state,
        data: action.payload,
        isDraft: true
      };
    case 'PUBLISH':
      return {
        ...state,
        data: action.payload,
        isDraft: false
      };
    case 'UPDATE_VALIDATION':
      return {
        ...state,
        validation: {
          ...action.payload,
          lastChecked: Date.now() // Ensure lastChecked is always updated
        }
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'RESET':
      return initialState;
    // Add new action type handlers
    case 'NAVIGATE_TO_STEP':
      return {
        ...state,
        steps: {
          ...state.steps,
          currentStep: action.step
        }
      };
    case 'LOCK_VARIABLE':
      return {
        ...state,
        balance: {
          ...state.balance,
          lockedVariables: [...state.balance.lockedVariables, action.variable]
        }
      };
    case 'UNLOCK_VARIABLE':
      return {
        ...state,
        balance: {
          ...state.balance,
          lockedVariables: state.balance.lockedVariables.filter(v => v !== action.variable)
        }
      };
    case 'APPLY_TEMPLATE':
      return {
        ...state,
        template: {
          ...state.template,
          id: action.template.id,
          source: action.template.name,
          isCustomized: false
        },
        // Update data with template values
        data: {
          type: action.template.type,
          setting: action.template.setting,
          capacity: action.template.defaultCapacity,
          rks: action.template.defaultRks
        }
      };
    case 'RESET_VARIABLE':
      // This is a placeholder implementation - actual implementation would
      // need to know which variable to reset and what the default value is
      return state;
    case 'UPDATE_BALANCE':
      return {
        ...state,
        balance: {
          ...state.balance,
          xTotal: action.balance.xTotal,
          yTotal: action.balance.yTotal,
          isBalanced: action.balance.isBalanced
        }
      };
    default:
      return state;
  }
}

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(experienceReducer, initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Mock templates for development
  const mockTemplates: ExperienceTemplate[] = [
    {
      id: 'tutorial-template',
      name: 'Tutorial Template',
      description: 'Default template for educational tutorials',
      type: 'lecture',
      setting: 'academic',
      defaultCapacity: {
        min: 5,
        max: 30,
        target: 10
      },
      defaultRks: {
        total: 6000,
        breakdown: {
          host: 1200,
          attendees: 3000,
          curator: 300,
          venue: 600,
          production: 600,
          ai: 300
        },
        mining: {
          available: 3000,
          locked: 0,
          distributed: 0
        }
      },
      recommendedFor: ['curator', 'host']
    }
  ];

  const value: ExperienceContextValue = {
    state,
    dispatch,
    // Add updateStep method
    updateStep: (step, data) => {
      // Update step-specific data
      state[step as keyof ExperienceState] = {
        ...state[step as keyof ExperienceState],
        ...data
      };
      
      // Also update the main data property for backward compatibility
      dispatch({
        type: 'UPDATE_STEP',
        step: state.steps.currentStep,
        data
      });
    },
    experience: {
      current: state.data as Experience,
      draft: state.isDraft ? state.data as Experience : null,
      history: [],
      create: async () => {
        dispatch({ type: 'RESET' });
      },
      update: async (data) => {
        dispatch({
          type: 'UPDATE_STEP',
          step: state.currentStep,
          data
        });
      },
      publish: async () => {
        dispatch({
          type: 'PUBLISH',
          payload: state.data as Experience
        });
      }
    },
    evolution: {
      version: state.evolution.version,
      features: state.evolution.features,
      upgrade: async (experience) => {
        // Implementation for upgrading experience
        // This is a placeholder - actual implementation would update the experience
        // based on the evolution strategy
      }
    },
    validation: {
      errors: state.validation.errors,
      warnings: state.validation.warnings,
      validate: async () => {
        // Implementation for validation
        // This is a placeholder - actual implementation would validate the experience
        // against the current step requirements and update validation state
        return state.validation.isValid;
      }
    },
    // Add navigation implementation
    navigation: {
      goToStep: async (step) => {
        // Check if navigation is allowed
        if (state.steps.canNavigate(step)) {
          // Save current step data
          await value.navigation.saveCurrentStep();
          // Navigate to new step
          dispatch({ type: 'NAVIGATE_TO_STEP', step });
          return true;
        }
        return false;
      },
      canNavigate: (fromStep, toStep) => {
        // Implement navigation validation logic
        // This is a simplified implementation - the actual implementation would
        // check if the fromStep is complete and if the user can skip steps
        return state.steps.stepValidation[fromStep] || toStep < fromStep;
      },
      saveCurrentStep: async () => {
        // Save current step data
        // This is a placeholder - actual implementation would save the current
        // step data to state or storage
      }
    },
    // Add template management implementation
    templates: {
      available: mockTemplates,
      current: state.template.id ? 
        mockTemplates.find(t => t.id === state.template.id) || null : 
        null,
      apply: async (templateId) => {
        const template = mockTemplates.find(t => t.id === templateId);
        if (template) {
          dispatch({ type: 'APPLY_TEMPLATE', template });
        }
      },
      revertToTemplate: async () => {
        if (state.template.id) {
          const template = mockTemplates.find(t => t.id === state.template.id);
          if (template) {
            dispatch({ type: 'APPLY_TEMPLATE', template });
          }
        }
      }
    },
    // Add balance management implementation
    balance: {
      lockVariable: async (variable) => {
        // Check if locking this variable would make X=Y balance impossible
        // This is a placeholder - actual implementation would need to validate
        // against all current values
        dispatch({ type: 'LOCK_VARIABLE', variable });
        return true;
      },
      unlockVariable: async (variable) => {
        dispatch({ type: 'UNLOCK_VARIABLE', variable });
      },
      updateVariable: async (variable, value) => {
        // Update the variable value and recalculate balance
        // This is a placeholder - actual implementation would update the
        // specific variable and recalculate X=Y balance
        
        // Mock calculation of new balance
        const mockBalance: BalanceResult = {
          xTotal: state.balance.xTotal,
          yTotal: state.balance.yTotal,
          isBalanced: true,
          difference: 0,
          adjustableVariables: []
        };
        
        dispatch({ type: 'UPDATE_BALANCE', balance: mockBalance });
        return true;
      },
      getAdjustableVariables: () => {
        // Return list of variables that can be adjusted to maintain X=Y balance
        // This is a placeholder - actual implementation would return all variables
        // that are not locked
        return ['host', 'attendees', 'curator', 'venue', 'production']
          .filter(v => !state.balance.lockedVariables.includes(v));
      }
    }
  };

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}