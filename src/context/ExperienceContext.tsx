 // src/context/ExperienceContext.tsx
import React, { createContext, useReducer, useRef, useEffect } from 'react';
import type {
  Experience,
  ExperienceState,
  ExperienceAction,
  ExperienceContextValue,
  ValidationResult
} from '../interfaces/experience/types';

const initialState: ExperienceState = {
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
        validation: action.payload
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

  const value: ExperienceContextValue = {
    state,
    dispatch,
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
      upgrade: async () => {
        // Implementation for upgrading experience
      }
    },
    validation: {
      errors: state.validation.errors,
      warnings: state.validation.warnings,
      validate: async () => {
        // Implementation for validation
        return state.validation.isValid;
      }
    }
  };

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}
