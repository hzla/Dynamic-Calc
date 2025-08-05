const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        warn(message) {
          console.warn(`⚠️ Warning: ${message}`);
          return null;
        }
      });
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    experimentalStudio: true,
    testIsolation: false,
  },
  env: {
  	calcs: [
	  {
	    title: "Renegade Platinum",
	    url: './index.html?data=26138cc1d500b0cf7334&dmgGen=4&gen=7&switchIn=4&types=6',
	    testTrainer: 'Cynthia',
	    testTrainerMonFirstMove: 'Thunderbolt',
	    save: 'rp_test'
	  },
	  {
	    title: "Ancestral X",
	    url: './index.html?data=7a1ed35468b22ea01103&dmgGen=6&gen=6',
	    testTrainer: 'Wulfric',
	    testTrainerMonFirstMove: 'Ice Hammer',
	    save: false
	  }
	]
  }

});
