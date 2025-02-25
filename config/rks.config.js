module.exports = {
  // RKS Core Settings
  rks: {
    // UIMA Settings
    uima: {
      weeklyCredit: 18000,     // Weekly UIMA credit amount
      creditDay: 1,            // Monday = 1
      expiryDays: 7,          // Credits expire after 7 days
      minimumBid: 3000        // Minimum bid amount
    },

    // Role Allocations
    allocations: {
      host: 0.20,             // 20% to host
      attendees: 0.50,        // 50% to attendees
      curator: 0.05,          // 5% to curator
      venue: 0.10,            // 10% to venue
      production: 0.10,       // 10% to production
      ai: 0.05                // 5% reserved for AI (added to host in MVP)
    },

    // Mock Mining Settings
    mining: {
      authenticationWindow: 30 * 60,  // 30 minutes
      retryLimit: 3,
      minimumAttendees: 2,
      maximumAttendees: 1500
    },

    // Transaction Settings
    transactions: {
      enabled: true,
      storageType: 'database',  // Using database in MVP
      confirmations: 1,         // Instant in MVP
      maxRetries: 3
    }
  }
}
