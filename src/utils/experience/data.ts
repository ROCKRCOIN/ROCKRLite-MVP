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
  SettingOption,
  ExperienceTemplate
} from '../../interfaces/experience/types';
import { Version } from '../../interfaces/evolution/types';

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
 * JSON structure for venue data
 */
interface VenueJSON {
  [institutionId: string]: {
    institution_info: {
      name: string;
      status: string;
    };
    venues: {
      [venueId: string]: {
        basic_info: {
          name: string;
          capacity: number;
          type?: string;
          features?: string[];
        };
        profile_status: string;
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
 * Load venue data from JSON
 *
 * @param sizeCategory The size category of venues to load ('small', 'medium', 'large', 'micro')
 * @param options Options for loading data with domain specifics
 * @returns Promise resolving to processed venue data
 */
export const loadVenues = async (
  sizeCategory: 'small' | 'medium' | 'large' | 'micro' = 'small',
  options: DataLoadOptions = {}
): Promise<any> => {
  try {
    const response = await fetch(`/data/venues/oxford-${sizeCategory}-venues.json`);
    if (!response.ok) {
      throw new Error(`Failed to load venues: ${response.statusText}`);
    }
    const data: VenueJSON = await response.json();
    
    // Process the venue data into a more usable format
    // This is a simplified implementation - in a real implementation,
    // you'd need to transform this into the structure expected by your components
    const processedVenues: any = {};
    
    Object.entries(data).forEach(([institutionId, institution]) => {
      const venues = Object.entries(institution.venues).map(([venueId, venue]) => ({
        id: venueId,
        institutionId,
        institutionName: institution.institution_info.name,
        name: venue.basic_info.name,
        capacity: venue.basic_info.capacity,
        type: venue.basic_info.type || 'standard',
        features: venue.basic_info.features || [],
        status: venue.profile_status,
        address: `${institution.institution_info.name}, Oxford` // Simplified address
      }));
      
      processedVenues[institutionId] = {
        info: institution.institution_info,
        venues
      };
    });
    
    return processedVenues;
  } catch (error) {
    console.error(`Error loading ${sizeCategory} venues:`, error);
    return {};
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

/**
 * Convert venue data from JSON format to Experience Location format
 * 
 * @param venueId ID of the venue
 * @param institutionId ID of the institution
 * @param sizeCategory Size category of venues to search
 * @returns Promise resolving to Location object
 */
export const getVenueAsLocation = async (
  venueId: string,
  institutionId: string,
  sizeCategory: 'small' | 'medium' | 'large' | 'micro' = 'small'
): Promise<any> => {
  try {
    const venues = await loadVenues(sizeCategory);
    
    if (!venues[institutionId] || !venues[institutionId].venues) {
      throw new Error(`Institution '${institutionId}' not found`);
    }
    
    const venue = venues[institutionId].venues.find((v: any) => v.id === venueId);
    if (!venue) {
      throw new Error(`Venue '${venueId}' not found in institution '${institutionId}'`);
    }
    
    // Convert to Location format
    return {
      country: 'United Kingdom',
      city: 'Oxford',
      venue: {
        id: venue.id,
        name: venue.name,
        type: venue.type,
        capacity: venue.capacity,
        features: venue.features,
        address: venue.address
      },
      capacity: venue.capacity,
      features: venue.features
    };
  } catch (error) {
    console.error(`Error getting venue as location:`, error);
    return null;
  }
};

/**
 * Load a list of all institutions from venue data
 * 
 * @param options Options for loading data with domain specifics
 * @returns Promise resolving to list of institutions
 */
export const loadInstitutions = async (
  options: DataLoadOptions = {}
): Promise<any[]> => {
  try {
    // Load venues from all size categories and extract institutions
    const smallVenues = await loadVenues('small');
    const mediumVenues = await loadVenues('medium');
    const largeVenues = await loadVenues('large');
    const microVenues = await loadVenues('micro');
    
    // Combine all institutions
    const allInstitutions = [
      ...Object.entries(smallVenues).map(([id, data]: [string, any]) => ({
        id,
        name: data.info.name,
        status: data.info.status,
        size: 'small',
        venueCount: data.venues.length
      })),
      ...Object.entries(mediumVenues).map(([id, data]: [string, any]) => ({
        id,
        name: data.info.name,
        status: data.info.status,
        size: 'medium',
        venueCount: data.venues.length
      })),
      ...Object.entries(largeVenues).map(([id, data]: [string, any]) => ({
        id,
        name: data.info.name,
        status: data.info.status,
        size: 'large',
        venueCount: data.venues.length
      })),
      ...Object.entries(microVenues).map(([id, data]: [string, any]) => ({
        id,
        name: data.info.name,
        status: data.info.status,
        size: 'micro',
        venueCount: data.venues.length
      }))
    ];
    
    // Remove duplicates based on ID
    const uniqueInstitutions = allInstitutions.filter(
      (institution, index, self) => 
        index === self.findIndex(i => i.id === institution.id)
    );
    
    return uniqueInstitutions;
  } catch (error) {
    console.error('Error loading institutions:', error);
    return [];
  }
};

/**
 * Generate an experience template from JSON data
 * 
 * @param type Experience type
 * @param setting Experience setting 
 * @param version Current version
 * @returns Promise resolving to ExperienceTemplate
 */
export const generateTemplateFromJson = async (
  type: ExperienceType,
  setting: ExperienceSetting,
  version: Version
): Promise<ExperienceTemplate | null> => {
  try {
    // Load type data
    const response = await fetch('/data/experience-types/types.json');
    if (!response.ok) {
      throw new Error(`Failed to load experience types: ${response.statusText}`);
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
    
    // Create a template
    // This is a placeholder implementation - in a real implementation,
    // you'd need to implement the full template generation logic
    // Note: This implementation will need to be adjusted based on
    // the actual ExperienceTemplate interface defined in your project
    
    // Return null for now to avoid errors with the template construction
    return null;
  } catch (error) {
    console.error(`Error generating template:`, error);
    return null;
  }
};