module.exports = {
  // Evolution Settings
  evolution: {
    // Version Control
    version: {
      current: '1.0.0',
      minimum: '1.0.0',
      supported: ['1.0.0'],
      next: '1.1.0'
    },

    // Feature Flags
    features: {
      // Core Features
      core: {
        whatsappVerification: true,
        domainVerification: true,
        experienceCreation: true,
        mining: true
      },

      // MVP Features
      mvp: {
        databaseStorage: true,     // Using database storage
        mockBlockchain: true,      // Using mock blockchain
        singleDomain: true,        // Oxford-only initially
        aiDisabled: true          // AI features disabled
      },

      // Future Features (disabled in MVP)
      future: {
        blockchain: false,         // Real blockchain
        crossDomain: false,        // Multi-domain support
        aiFeatures: false,         // AI features
        advancedMining: false     // Advanced mining features
      }
    },

    // Migration Settings
    migrations: {
      // Database to Blockchain
      blockchainMigration: {
        enabled: false,
        path: 'database-to-blockchain',
        requirements: ['blockchain'],
        dataTypes: ['transactions', 'balances', 'mining']
      },

      // Single to Multi-Domain
      domainMigration: {
        enabled: false,
        path: 'single-to-multi-domain',
        requirements: ['crossDomain'],
        dataTypes: ['users', 'experiences', 'venues']
      }
    },

    // State Management
    state: {
      persistence: 'database',
      backup: {
        enabled: true,
        frequency: '24h',
        retention: '30d'
      },
      recovery: {
        enabled: true,
        maxAttempts: 3,
        timeout: '5m'
      }
    }
  }
}
