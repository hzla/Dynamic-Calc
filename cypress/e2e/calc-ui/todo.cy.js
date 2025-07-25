let skipNextSetup = false;


describe('Renegade Platinum Calc', () => {
  before(() => {
      
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.viewport(1920, 1080)


    if (skipNextSetup) {
      skipNextSetup = false; // Reset
      return;
    }

    cy.visit('./index.html?data=26138cc1d500b0cf7334&dmgGen=4&gen=7&switchIn=4&types=6')
    // Visit Renegade Platinum Calc
    
  })

  it('displays the Rom Title', () => {
    cy.get('#rom-title').should('have.text', 'Renegade Platinum')
    // skipNextSetup = true;
  })


  it('no-setup:can display and navigate trainer sets', () => {
    
    // Check to see if trainer sets are loaded
    cy.get('.select2-container.set-selector.opposing .select2-chosen:visible').first().click({force: true})
    cy.get('.select2-results li:visible').should('have.length.greaterThan', 0)
    
    // Check to see if it loads Cynthia's Pokemon
    cy.get('.select2-search input:visible').first().type("Cynthia")
    cy.get('.select2-result-label').first().click({force: true})
    cy.get('.trainer-pok-list.opposing .trainer-pok-container').should('have.length', 5)

    // Check to see if clicking on Cynthia's pokemon loads full moveset info, and damage numbers  


    // Check for sprite change

    // Check for 


  })

  it('no-setup:can import and navigate basic imported sets with no met location', () => {
    
    // Check that imports will show sprites in import box
    cy.fixture('em_imp_basic_import.txt').then((text) => {
      cy.get('textarea').invoke('val', text)
    })
    cy.get('#import').click()
    cy.get('.player-poks .trainer-pok').should('have.length', 17)


    // Check that clicking a sprite loads a pokemon

    cy.get("[data-id='Zoroark (My Box)']").click()
    cy.get('.select2-chosen').first().should('have.text', "Zoroark (My Box)")


  })

  
})


// check for box import functionality


// check for save reading functionality

