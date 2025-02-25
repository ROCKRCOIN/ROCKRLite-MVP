module.exports = {
  // Domain Settings
  domains: {
    // Primary Domain Configuration
    primary: {
      id: 'oxford',
      name: 'University of Oxford',
      emailDomain: 'ox.ac.uk',
      status: 'active',
      features: ['all']
    },

    // Domain-Specific Settings
    settings: {
      weeklyCredit: 18000,      // Standard weekly UIMA credit
      targetSeatPrice: 3000,    // Target RKS per seat
      defaultCapacity: 2,       // Default experience capacity
      reservedSeats: 0.10,      // 10% seats reserved for last 24h
      
      // Experience Types Enabled
      experienceTypes: [
        'educational',
        'arts',
        'community',
        'sports',
        'retail',
        'health'
      ],

      // Venue Categories
      venueCategories: [
        'tutorial',
        'lecture',
        'seminar',
        'performance',
        'meeting',
        'coaching'
      ]
    },

    // Cross-Domain Settings
    crossDomain: {
      enabled: false,           // Disabled in MVP
      allowedDomains: [],      // Empty in MVP
      restrictions: {
        shareExperiences: false,
        shareVenues: false,
        shareUsers: false
      }
    },

    // Evolution Settings
    evolution: {
      version: '1.0.0',
      features: ['core', 'experience', 'mining'],
      migrations: [],
      upgradePath: ['cross-domain', 'blockchain']
    }
  }
}
