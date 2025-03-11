/**
 * Experience Data Utilities
 * 
 * Provides functions for loading and processing experience data from JSON files.
 * This includes experience types, settings, categories, and hierarchical structures.
 * Follows the evolution-ready architecture and supports cross-domain functionality.
 */

import type { 
    ExperienceType, 
    ExperienceSetting,
    ExperienceTypeOption,
    SettingOption
  } from '../../interfaces/experience/types';
  
  /**
   * JSON structure for experience types
   */
  interface ExperienceTypeJSON {
    version: string;
    lastUpdated: string;
    types: {
      [key: string]: {
        id: string;
        label: string;
        icon: string;
        settings: {
          id: string;
          label: string;
          capacity_default: number[];
        }[];
      };
    };
  }
  
  /**
   * JSON structure for category hierarchies
   */
  interface CategoryStructureJSON {
    version: string;
    lastUpdated: string;
    categories: {
      [category: string]: {
        [subcategory: string]: {
          structure: {
            [level: string]: {
              [item: string]: {
                id: string;
                label: string;
                level_4?: {
                  [item: string]: {
                    id: string;
                    label: string;
                    level_5?: string[];
                  };
                };
              };
            };
          };
        };
      };
    };
  }
  
  /**
   * Category level structure for UI representation
   */
  export interface CategoryLevel {
    id: string;
    label: string;
    children?: CategoryLevel[];
  }
  
  /**
   * Options for loading data with domain-specific configurations
   */
  export interface DataLoadOptions {
    domain?: string;
    version?: string;
    features?: string[];
  }
  
  /**
   * Load experience types from JSON
   * 
   * @param options Options for loading data with domain specifics
   * @returns Promise resolving to array of ExperienceTypeOption
   */
  export const loadExperienceTypes = async (
    options: DataLoadOptions = {}
  ): Promise<ExperienceTypeOption[]> => {
    try {
      // In a real implementation, this would check domain-specific types
      // For MVP, we'll load from the static JSON file
      const response = await fetch('/data/experience-types/types.json');
      if (!response.ok) {
        throw new Error(`Failed to load experience types: ${response.statusText}`);
      }
      
      const data: ExperienceTypeJSON = await response.json();
      
      // Convert JSON structure to ExperienceTypeOption[]
      return Object.entries(data.types).map(([key, type]) => ({
        id: key as ExperienceType,
        name: type.label,
        description: `${type.label} experiences (${type.settings.length} settings available)`,
        icon: undefined, // This would be converted to a React component in actual UI
      }));
    } catch (error) {
      console.error('Error loading experience types:', error);
      return [];
    }
  };
  
  /**
   * Load settings for a specific experience type
   * 
   * @param type The experience type to load settings for
   * @param options Options for loading data with domain specifics 
   * @returns Promise resolving to array of SettingOption
   */
  export const loadExperienceSettings = async (
    type: ExperienceType,
    options: DataLoadOptions = {}
  ): Promise<SettingOption[]> => {
    try {
      const response = await fetch('/data/experience-types/types.json');
      if (!response.ok) {
        throw new Error(`Failed to load experience settings: ${response.statusText}`);
      }
      
      const data: ExperienceTypeJSON = await response.json();
      
      // Find the specific type in the JSON data
      const typeData = data.types[type];
      if (!typeData) {
        throw new Error(`Experience type '${type}' not found`);
      }
      
      // Convert settings to SettingOption[]
      return typeData.settings.map(setting => ({
        id: setting.id as ExperienceSetting,
        name: setting.label,
        description: `${setting.label} setting with capacity options of ${setting.capacity_default.join(', ')} attendees`,
        icon: undefined, // This would be populated based on icons in a real implementation
      }));
    } catch (error) {
      console.error(`Error loading settings for experience type '${type}':`, error);
      return [];
    }
  };
  
  /**
   * Get default capacity values for a specific experience type and setting
   * 
   * @param type The experience type
   * @param setting The experience setting
   * @param options Options for loading data with domain specifics
   * @returns Promise resolving to array of capacity options
   */
  export const getDefaultCapacityOptions = async (
    type: ExperienceType,
    setting: ExperienceSetting,
    options: DataLoadOptions = {}
  ): Promise<number[]> => {
    try {
      const response = await fetch('/data/experience-types/types.json');
      if (!response.ok) {
        throw new Error(`Failed to load capacity options: ${response.statusText}`);
      }
      
      const data: ExperienceTypeJSON = await response.json();
      
      // Find the specific type in the JSON data
      const typeData = data.types[type];
      if (!typeData) {
        throw new Error(`Experience type '${type}' not found`);
      }
      
      // Find the specific setting in the type data
      const settingData = typeData.settings.find(s => s.id === setting);
      if (!settingData) {
        throw new Error(`Experience setting '${setting}' not found for type '${type}'`);
      }
      
      return settingData.capacity_default;
    } catch (error) {
      console.error(`Error loading capacity options for '${type}/${setting}':`, error);
      return [5, 10, 15, 20]; // Fallback default values
    }
  };
  
  
  /**
   * Load subject categories for experience creation
   * 
   * @param options Options for loading data with domain specifics
   * @returns Promise resolving to array of top-level categories
   */
  export const loadSubjectCategories = async (
    options: DataLoadOptions = {}
  ): Promise<CategoryLevel[]> => {
    try {
      const response = await fetch('/data/experience-types/category-structure.json');
      if (!response.ok) {
        throw new Error(`Failed to load subject categories: ${response.statusText}`);
      }
      
      const data: CategoryStructureJSON = await response.json();
      
      // Transform the nested JSON structure to a flat list of top-level categories
      // For Step 2's "Experience Subject" selection
      const categories: CategoryLevel[] = [];
      
      // Process the category structure
      // This is a simplified implementation - in a real implementation,
      // you'd need to handle the full nested structure based on UI requirements
      Object.entries(data.categories).forEach(([categoryKey, category]) => {
        Object.entries(category).forEach(([subcategoryKey, subcategory]) => {
          // For level 3 (as mentioned in the specification)
          Object.entries(subcategory.structure).forEach(([levelKey, level]) => {
            if (levelKey === 'level_3') {
              // Convert level 3 items to CategoryLevel objects
              const level3Categories = Object.values(level).map(item => ({
                id: item.id,
                label: item.label,
                // In a full implementation, you would recursively process deeper levels
                children: item.level_4 ? Object.values(item.level_4).map(l4Item => ({
                  id: l4Item.id,
                  label: l4Item.label,
                  // You could continue with level_5 if needed
                })) : undefined
              }));
              
              categories.push(...level3Categories);
            }
          });
        });
      });
      
      return categories;
    } catch (error) {
      console.error('Error loading subject categories:', error);
      return [];
    }
  };
  
  /**
   * Load genre categories for experience creation
   * 
   * This would be similar to loadSubjectCategories but focused on genres.
   * In the MVP we're extracting from level 6 as mentioned in the spec.
   * 
   * @param options Options for loading data with domain specifics
   * @returns Promise resolving to array of genre categories
   */
  export const loadGenreCategories = async (
    options: DataLoadOptions = {}
  ): Promise<string[]> => {
    try {
      // In a real implementation, this would load from the genre array file
      // For this MVP implementation, we'll return a placeholder
      // The "Experience Genre Array: Levels 6" file mentioned in the specification
      // would be processed here
      
      // This is a placeholder for demonstration
      return [
        "Academic",
        "Professional",
        "Entertainment",
        "Recreational",
        "Cultural"
      ];
    } catch (error) {
      console.error('Error loading genre categories:', error);
      return [];
    }
  };
  
  /**
   * Gets a recommended template based on user profile and domain
   * 
   * @param profile The user's profile information
   * @param domain The current domain
   * @returns Promise resolving to recommended template configuration
   */
  export const getRecommendedTemplate = async (
    profile: any,
    domain: string
  ): Promise<any> => {
    // This would analyze the user's profile and history
    // For MVP, return the base tutorial template as specified in the requirements
    
    return {
      id: 'base-tutorial',
      name: 'Initial Base Tutorial Template',
      type: 'educational',
      setting: 'tutorial',
      host: 1,
      organisers: 0,
      attendees: 2,
      // Additional template properties would be included here
    };
  };
  
  