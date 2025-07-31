const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Handle uncaught exceptions
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    experimentalStudio: true,
    testIsolation: false,
  },

});
