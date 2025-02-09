module.exports = {
  // Authentication settings
  auth: {
    // Session configuration
    session: {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      updateAge: 24 * 60 * 60,  // 24 hours
    },

    // WhatsApp verification settings
    whatsapp: {
      enabled: true,
      timeout: 5 * 60,  // 5 minutes
      retryLimit: 3
    },

    // Domain verification settings
    domain: {
      enabled: true,
      allowedDomains: [
        'ox.ac.uk'  // Starting with Oxford domain
      ],
      verificationExpiry: 24 * 60 * 60  // 24 hours
    },

    // User roles
    roles: [
      'curator',
      'host',
      'attendee',
      'venue',
      'organizer',
      'authenticator'
    ],

    // Initial admin settings
    admin: {
      enabled: true,
      domain: 'ox.ac.uk',
      roles: ['curator', 'authenticator']
    }
  }
}
