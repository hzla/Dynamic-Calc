// Tests to make sure there are no invalid/mispelled moves, pokemon, or items in the set data
// TO RUN: npx cypress run --spec "cypress/e2e/calc-ui/dataValidation.cy.js"




let skipNextSetup = false;

let calcs = Cypress.env('calcs')


for (let calc of calcs) {
  describe(calc.title, () => {
    before(() => {
        
      cy.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
      })
      cy.viewport(1920, 1080)
      cy.visit(calc.url)
      // Visit Renegade Platinum Calc
      
    })
    
    it('has fully valid named pokemon in set data', () => {
      cy.get('#clearSets').click()
      let isFullValid = true

      const cleanString = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      cy.window().then((win) => {

        let sets = win.setdex

        for (let pok in sets) {
          let pokId = cleanString(pok)

          // Make sure mon exists
          if (typeof win.SPECIES_BY_ID[8][pokId] == "undefined" && typeof win.pokedex[pok] == "undefined") {
            isFullValid = false
            console.log(pok)
            assert.fail('Invalid pok found');
          }
          if (isFullValid == false) {
            break
          }
        }
      });
    })

    it('has fully valid moves and items in set data', () => {
      cy.get('#clearSets').click()
      let isFullValid = true

      const cleanString = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      cy.window().then((win) => {

        let sets = win.setdex

        let itemOptions = cy.get('#itemR1').find('option')

        for (let pok in sets) {
          
          let pok_sets = sets[pok]

          for (let set in pok_sets) {
            let moves = pok_sets[set]["moves"]

            for (let move of moves) {
              if (typeof win.moves[move] == "undefined" && move != "") {
                isFullValid = false
                console.log(move)
                assert.fail(`Invalid move found: ${move} on ${set}`)
              }
            }

            let item = pok_sets[set]["item"]
            let itemId = cleanString(item)

            if (typeof win.ITEMS_BY_ID[8][itemId] == "undefined" && item != "None" && item != "-" && win.items.indexOf(item) == -1 ) {
              isFullValid = false
              cy.task('warn', `Invalid item found: ${item} on ${set}`)
            }
          }
          // Make sure move exists
          if (isFullValid == false) {
            break
          }
        }
      });
    })
  })  
}









// check to make sure every listed move exists



