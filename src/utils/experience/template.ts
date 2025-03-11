/**
 * Experience Template Utilities
 * 
 * Utilities for managing experience templates:
 * - Template selection based on user profile
 * - Template application
 * - Creating experiences from templates
 * - JSON data integration
 * - UIMA eligibility checking
 * - RKS allocation with X=Y balance
 * 
 * Based on specifications from "Revised Multi-Step Process" and
 * "Clarification of Specification re Live Experience Multi-Step Process and RKS Allocation"
 */

import type {
  Experience,
  ExperienceType,
  ExperienceSetting,
  ExperienceTemplate,
  RKSAllocation,
  RKSEstimate
} from '../../interfaces/experience/types';

import type { Version } from '../../interfaces/evolution/types';
import { getDefaultCapacityOptions } from './data';

/**
 * Template system configuration interface
 */
export interface TemplateSystemConfig {
  defaultWeeklyUimaCredit: number;
  defaultTargetSeatPrice: number;
  eligibleTypes: string[];
  eligibleSettings: string[];
  eligibleSubjects: string[];
  eligibleGenres: string[];
}

/**
 * Default template system configuration
 * Based on "Clarification of Specification" document
 */
export const DEFAULT_TEMPLATE_CONFIG: TemplateSystemConfig = {
  defaultWeeklyUimaCredit: 18000,
  defaultTargetSeatPrice: 6000, // 3000 for X and 3000 for Y sides
  eligibleTypes: ['educational', 'arts', 'lecture', 'workshop', 'seminar', 'performance'],
  eligibleSettings: ['tutorial', 'lecture_presentation', 'seminar', 'workshop', 'academic', 'cultural', 'professional'],
  eligibleSubjects: [], // Would be populated from subject array
  eligibleGenres: [] // Would be populated from genre array
};

/**
 * Default base tutorial template as specified in requirements
 * This is the template shown for first-time curators
 */
export const BASE_TUTORIAL_TEMPLATE: ExperienceTemplate = {
  id: 'base-tutorial',
  name: 'Initial Base Tutorial Template',
  description: 'Educational tutorial for first-time curators',
  type: 'educational' as ExperienceType,
  setting: 'tutorial' as ExperienceSetting,
  defaultCapacity: {
    min: 1,
    max: 5,
    target: 3
  },
  defaultRks: {
    total: 18000, // For 3 attendees at 6000 each
    breakdown: {
      host: 3600, // 20% as per MVP
      attendees: 9000, // 50% as per MVP
      curator: 900, // 5% as per MVP
      venue: 1800, // 10% as per MVP
      production: 1800, // 10% as per MVP
      ai: 900 // 5% as per MVP (greyed out in MVP)
    },
    mining: {
      available: 9000, // Example value
      locked: 0,
      distributed: 0
    }
  },
  recommendedFor: ['first-time-curator', 'attendee', 'student']
};

/**
 * Checks if an experience type/setting/subject/genre is eligible for UIMA funding
 * Based on "Clarification of Specification" document
 * 
 * @param config Template system configuration
 * @param type Experience type
 * @param setting Experience setting
 * @param subject Experience subject
 * @param genre Experience genre
 * @returns Boolean indicating UIMA eligibility
 */
export const isEligibleForUima = (
  config: TemplateSystemConfig = DEFAULT_TEMPLATE_CONFIG,
  type?: ExperienceType,
  setting?: ExperienceSetting,
  subject?: string,
  genre?: string
): boolean => {
  // Check type eligibility
  if (type && !config.eligibleTypes.includes(type)) {
    return false;
  }
  
  // Check setting eligibility
  if (setting && !config.eligibleSettings.includes(setting)) {
    return false;
  }
  
  // Check subject eligibility if provided
  if (subject && config.eligibleSubjects.length > 0 && !config.eligibleSubjects.includes(subject)) {
    return false;
  }
  
  // Check genre eligibility if provided
  if (genre && config.eligibleGenres.length > 0 && !config.eligibleGenres.includes(genre)) {
    return false;
  }
  
  // If all checks pass or required fields aren't provided, consider it eligible
  return true;
};

/**
 * Gets the appropriate starter template based on user profile type
 * According to specifications, templates are selected based on curator's most active profile
 *
 * @param profileType - The profile type of the curator
 * @param availableTemplates - Available experience templates
 * @returns The recommended template for the profile type
 */
export const getStarterTemplate = (
  profileType: string,
  availableTemplates: ExperienceTemplate[]
): ExperienceTemplate | undefined => {
  // Default template for first-time curators (educational tutorial)
  const defaultTemplate = availableTemplates.find(
    template => template.type === 'lecture' && template.setting === 'academic'
  ) || BASE_TUTORIAL_TEMPLATE;
  
  // Examples from the specification:
  // - For attendee > college student, use the "Base Tutorial Template"
  // - For host > high street retail, use the "Product Launch Template"
  
  // For student or attendee profiles
  if (profileType === 'attendee') {
    return availableTemplates.find(
      template => template.recommendedFor.includes('attendee')
    ) || defaultTemplate;
  }
  
  // For hosts with retail profile, recommend retail template
  if (profileType === 'host') {
    return availableTemplates.find(
      template => template.recommendedFor.includes('host')
    ) || defaultTemplate;
  }
  
  // For venue profiles
  if (profileType === 'venue') {
    return availableTemplates.find(
      template => template.recommendedFor.includes('venue')
    ) || defaultTemplate;
  }
  
  // For curator profiles
  if (profileType === 'curator') {
    // If they've created experiences before, check for a "previously successful" template
    return availableTemplates.find(
      template => template.recommendedFor.includes('curator')
    ) || defaultTemplate;
  }
  
  // Return default template if no specific match
  return defaultTemplate;
};

/**
 * Applies a template to create a new experience
 *
 * @param templateId - The ID of the template to apply
 * @param availableTemplates - Available templates
 * @returns A new experience based on the template
 */
export const applyTemplate = (
  templateId: string,
  availableTemplates: ExperienceTemplate[]
): Partial<Experience> => {
  // Find the template
  const template = availableTemplates.find(t => t.id === templateId);
  
  if (!template) {
    // If template not found, return empty object
    return {};
  }
  
  // Create a new experience from the template
  return {
    id: `exp-${Date.now()}`,
    type: template.type,
    setting: template.setting,
    subject: template.subject,
    subjectLevel: template.subjectLevel,
    genre: template.genre,
    capacity: template.defaultCapacity ? { ...template.defaultCapacity } : undefined,
    rks: template.defaultRks ? JSON.parse(JSON.stringify(template.defaultRks)) : undefined,
    status: 'draft'
  };
};

/**
 * Creates a default template based on specified experience type and setting
 * Used when no matching template is available
 *
 * @param type - The experience type to create template for
 * @param setting - The experience setting
 * @returns A new template with default values
 */
export const createDefaultTemplate = (
  type: ExperienceType,
  setting: ExperienceSetting
): ExperienceTemplate => {
  // Generate a unique ID
  const id = `template-${type}-${setting}-${Date.now()}`;
  
  // Generate appropriate name and description
  const name = `${setting.charAt(0).toUpperCase() + setting.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const description = `Default template for ${setting} ${type} experiences`;
  
  // Create default capacity based on type
  let defaultCapacity = { min: 5, max: 50, target: 15 };
  
  if (type === 'lecture') {
    defaultCapacity = { min: 10, max: 100, target: 30 };
  } else if (type === 'workshop') {
    defaultCapacity = { min: 5, max: 30, target: 15 };
  } else if (type === 'performance') {
    defaultCapacity = { min: 20, max: 200, target: 50 };
  }
  
  // Default subject and level based on type and setting
  let subject: string | undefined;
  let subjectLevel: string | undefined;
  let genre: string | undefined;
  
  if (setting === 'academic') {
    if (type === 'lecture') {
      subject = 'General Education';
      subjectLevel = 'Undergraduate';
    } else if (type === 'workshop') {
      subject = 'Research Methods';
      subjectLevel = 'Graduate';
    } else if (type === 'seminar') {
      subject = 'Advanced Topics';
      subjectLevel = 'Graduate';
    }
  } else if (setting === 'professional') {
    subject = 'Professional Development';
    subjectLevel = 'Intermediate';
  }
  
  // Create default RKS allocation
  const defaultRks = {
    total: defaultCapacity.target * 6000, // 6000 RKS per attendee as per specification
    breakdown: {
      host: defaultCapacity.target * 1200, // 20% per specification
      attendees: defaultCapacity.target * 3000, // 50% per specification
      curator: defaultCapacity.target * 300, // 5% per specification
      venue: defaultCapacity.target * 600, // 10% per specification
      production: defaultCapacity.target * 600, // 10% per specification
      ai: defaultCapacity.target * 300 // 5% per specification
    },
    mining: {
      available: defaultCapacity.target * 80, // Default mining values
      locked: 0,
      distributed: 0
    }
  };
  
  // Create recommended profile types based on type and setting
  const recommendedFor: string[] = [];
  
  if (type === 'lecture' && setting === 'academic') {
    recommendedFor.push('attendee', 'curator');
  } else if (type === 'workshop' && setting === 'academic') {
    recommendedFor.push('host', 'curator');
  } else if (type === 'exhibition' && setting === 'professional') {
    recommendedFor.push('host');
  } else if (type === 'performance' && setting === 'cultural') {
    recommendedFor.push('venue');
  }
  
  return {
    id,
    name,
    description,
    type,
    setting,
    subject,
    subjectLevel,
    genre,
    defaultCapacity,
    defaultRks,
    recommendedFor
  };
};

/**
 * Customizes an existing template
 *
 * @param template - The base template to customize
 * @param customizations - Customization parameters
 * @returns A customized template
 */
export const customizeTemplate = (
  template: ExperienceTemplate,
  customizations: Partial<{
    name: string;
    description: string;
    capacity: { min: number; max: number; target: number };
    subject: string;
    subjectLevel: string;
    genre: string;
    rksAllocations: Record<string, number>;
    recommendedFor: string[];
  }>
): ExperienceTemplate => {
  // Create a deep copy of the template
  const customized = JSON.parse(JSON.stringify(template)) as ExperienceTemplate;
  
  // Apply customizations
  if (customizations.name) {
    customized.name = customizations.name;
  }
  
  if (customizations.description) {
    customized.description = customizations.description;
  }
  
  if (customizations.capacity) {
    customized.defaultCapacity = { ...customizations.capacity };
  }
  
  if (customizations.subject) {
    customized.subject = customizations.subject;
  }
  
  if (customizations.subjectLevel) {
    customized.subjectLevel = customizations.subjectLevel;
  }
  
  if (customizations.genre) {
    customized.genre = customizations.genre;
  }
  
  if (customizations.recommendedFor) {
    customized.recommendedFor = [...customizations.recommendedFor];
  }
  
  // Apply RKS allocation customizations
  if (customizations.rksAllocations && customized.defaultRks) {
    Object.entries(customizations.rksAllocations).forEach(([key, value]) => {
      if (customized.defaultRks?.breakdown && key in customized.defaultRks.breakdown) {
        (customized.defaultRks.breakdown as Record<string, number>)[key] = value;
      }
    });
    
    // Recalculate total
    if (customized.defaultRks.breakdown) {
      customized.defaultRks.total = Object.values(customized.defaultRks.breakdown).reduce((sum, value) => sum + value, 0);
    }
  }
  
  // Create a new ID for the customized template
  customized.id = `${template.id}-custom-${Date.now()}`;
  
  return customized;
};

/**
 * Calculates RKS allocation for a template
 * Follows X=Y balance requirements from specification
 * 
 * @param template Experience template
 * @param attendeeCount Number of attendees (defaults to template target)
 * @param config Template system configuration
 * @returns RKS allocation breakdown
 */
export const calculateTemplateRks = (
  template: ExperienceTemplate,
  attendeeCount?: number,
  config: TemplateSystemConfig = DEFAULT_TEMPLATE_CONFIG
): RKSAllocation => {
  // Use template target capacity if attendee count not provided
  const effectiveAttendeeCount = attendeeCount || template.defaultCapacity.target;
  
  // Calculate total based on attendee count and target seat price
  const total = effectiveAttendeeCount * config.defaultTargetSeatPrice;
  
  // Calculate breakdown based on percentages from MVP spec
  const breakdown = {
    host: total * 0.2, // 20% for MVP
    attendees: total * 0.5, // 50% for MVP
    curator: total * 0.05, // 5% for MVP
    venue: total * 0.1, // 10% for MVP
    production: total * 0.1, // 10% for MVP
    ai: total * 0.05 // 5% for MVP (greyed out in MVP)
  };
  
  // Calculate mining amounts
  const mining = {
    available: breakdown.attendees, // Available mining equals attendee allocation
    locked: 0,
    distributed: 0
  };
  
  return {
    total,
    breakdown,
    mining
  };
};

/**
 * Creates an RKS estimate for the experience creation process
 * 
 * @param type Experience type
 * @param setting Experience setting
 * @param capacity Target capacity
 * @param config Template system configuration
 * @returns RKS estimate for the experience
 */
export const createRksEstimate = (
  type: ExperienceType,
  setting: ExperienceSetting,
  capacity: number,
  config: TemplateSystemConfig = DEFAULT_TEMPLATE_CONFIG
): RKSEstimate => {
  // Calculate total RKS based on capacity and target seat price
  const total = capacity * config.defaultTargetSeatPrice;
  
  // Calculate mining amount based on specification
  const mining = total * 0.5; // 50% for attendees which becomes the mining amount
  
  // Calculate distribution based on percentages
  return {
    total,
    mining,
    distribution: {
      host: total * 0.2, // 20% for MVP
      attendees: total * 0.5, // 50% for MVP
      venue: total * 0.1, // 10% for MVP
      curator: total * 0.05, // 5% for MVP
      production: total * 0.1 // 10% for MVP
    }
  };
};

/**
 * Creates a blank experience based on a template
 * 
 * @param template Experience template to use
 * @param domain Domain identifier
 * @param version Current version
 * @returns Partial experience object
 */
export const createFromTemplate = (
  template: ExperienceTemplate,
  domain: string,
  version: Version
): Partial<Experience> => {
  // Create basic experience structure from template
  return {
    type: template.type,
    setting: template.setting,
    subject: template.subject,
    subjectLevel: template.subjectLevel,
    genre: template.genre,
    capacity: {
      ...template.defaultCapacity
    },
    status: 'draft'
  };
};

/**
 * Gets default capacity options based on type and setting
 * If available from JSON data, uses that; otherwise provides reasonable defaults
 * 
 * @param type Experience type
 * @param setting Experience setting
 * @returns Promise resolving to array of capacity options
 */
export const getCapacityOptionsForTemplate = async (
  type: ExperienceType,
  setting: ExperienceSetting
): Promise<number[]> => {
  try {
    // First try to get from JSON data
    const jsonOptions = await getDefaultCapacityOptions(type, setting);
    if (jsonOptions && jsonOptions.length > 0) {
      return jsonOptions;
    }
    
    // If JSON data not available, use hardcoded defaults based on type/setting
    if (type === 'lecture') {
      if (setting === 'academic') {
        return [10, 20, 30, 50, 75, 100];
      } else {
        return [10, 25, 50, 75];
      }
    } else if (type === 'workshop') {
      return [5, 10, 15, 20, 30];
    } else if (type === 'performance') {
      return [20, 50, 100, 200, 500];
    } else if (type === 'seminar') {
      return [10, 15, 20, 30];
    } else if (type === 'exhibition') {
      return [20, 50, 100, 200];
    }
    
    // Default options
    return [5, 10, 15, 20, 30, 50];
  } catch (error) {
    console.error(`Error getting capacity options for ${type}/${setting}:`, error);
    // Provide sensible defaults if unable to load from JSON
    return [5, 10, 15, 20, 30, 50];
  }
};

/**
 * Loads templates from an external source
 * Enhanced to use JSON data when available
 * 
 * @param source - The source identifier or URL
 * @returns Array of experience templates
 */
export const loadTemplates = async (
  source: string
): Promise<ExperienceTemplate[]> => {
  try {
    // Check if we should load from JSON data
    if (source === 'json' || source === 'data') {
      try {
        // Attempt to load from types.json
        const response = await fetch('/data/experience-types/types.json');
        if (response.ok) {
          const data = await response.json();
          
          // Process the JSON data into templates
          const jsonTemplates: ExperienceTemplate[] = [];
          
          // Create templates from the types data
          Object.entries(data.types).forEach(([typeKey, typeData]: [string, any]) => {
            typeData.settings.forEach((setting: any) => {
              // Create a template for each type-setting combination
              const template: ExperienceTemplate = {
                id: `template-${typeKey}-${setting.id}`,
                name: `${setting.label} ${typeData.label}`,
                description: `Template for ${setting.label} ${typeData.label} experiences`,
                type: typeKey as ExperienceType,
                setting: setting.id as ExperienceSetting,
                defaultCapacity: {
                  min: Math.min(...setting.capacity_default),
                  max: Math.max(...setting.capacity_default),
                  target: setting.capacity_default[Math.floor(setting.capacity_default.length / 2)]
                },
                recommendedFor: []
              };
              
              // Calculate RKS allocations for this template
              template.defaultRks = calculateTemplateRks(
                template,
                template.defaultCapacity.target
              );
              
              jsonTemplates.push(template);
            });
          });
          
          // If we successfully loaded templates from JSON, return them
          if (jsonTemplates.length > 0) {
            // Add BASE_TUTORIAL_TEMPLATE as the first option
            return [BASE_TUTORIAL_TEMPLATE, ...jsonTemplates];
          }
        }
      } catch (error) {
        console.error('Error loading templates from JSON:', error);
        // Fall back to hardcoded templates
      }
    }
    
    // Fallback to hardcoded templates if JSON loading fails or isn't requested
    const templates: ExperienceTemplate[] = [];
    
    // Add BASE_TUTORIAL_TEMPLATE
    templates.push(BASE_TUTORIAL_TEMPLATE);
    
    // Base tutorial template
    templates.push(createDefaultTemplate('lecture', 'academic'));
    
    // Product launch template
    const productLaunch = createDefaultTemplate('exhibition', 'professional');
    productLaunch.name = 'Product Launch Template';
    productLaunch.description = 'Template for product launch experiences';
    productLaunch.recommendedFor = ['host'];
    
    templates.push(productLaunch);
    
    // Performance template
    const performance = createDefaultTemplate('performance', 'cultural');
    performance.name = 'Cultural Performance Template';
    performance.description = 'Template for cultural performances';
    performance.recommendedFor = ['venue'];
    
    templates.push(performance);
    
    // Workshop template
    const workshop = createDefaultTemplate('workshop', 'academic');
    workshop.name = 'Academic Workshop Template';
    workshop.description = 'Template for academic workshops';
    workshop.recommendedFor = ['curator', 'host'];
    
    templates.push(workshop);
    
    return templates;
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
};

/**
 * Gets all available templates
 * Enhanced to use JSON data when available
 * 
 * @returns Promise resolving to array of available templates
 */
export const getAvailableTemplates = async (): Promise<ExperienceTemplate[]> => {
  return loadTemplates('json');
};

/**
 * Gets a template by ID
 * 
 * @param id Template ID
 * @returns Promise resolving to template if found, undefined otherwise
 */
export const getTemplateById = async (id: string): Promise<ExperienceTemplate | undefined> => {
  if (id === 'base-tutorial') {
    return BASE_TUTORIAL_TEMPLATE;
  }
  
  // Load all templates and find the one with matching ID
  const templates = await loadTemplates('json');
  return templates.find(template => template.id === id);
};

/**
 * Gets a recommended template based on user profile and domain
 * 
 * @param profile The user's profile information
 * @param domain The current domain
 * @returns Promise resolving to recommended template
 */
export const getRecommendedTemplate = async (
  profile: any,
  domain: string
): Promise<ExperienceTemplate> => {
  // Load all available templates
  const templates = await loadTemplates('json');
  
  // Get a starter template based on profile type
  const profileType = profile?.type || 'attendee';
  const template = getStarterTemplate(profileType, templates);
  
  // If no specific template is found, return the BASE_TUTORIAL_TEMPLATE
  return template || BASE_TUTORIAL_TEMPLATE;
};