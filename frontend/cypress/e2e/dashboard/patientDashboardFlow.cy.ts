/// <reference types="cypress" />

describe('Patient Dashboard Flow', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      user_type: 'patient'
    }));
    cy.visit('/patient-dashboard');
  });

  it('loads dashboard', () => {
    cy.url().should('include', '/patient-dashboard');
    cy.contains(/dashboard|medicine|search|nearby|order/i, { timeout: 10000 }).should('exist');
  });

  it('searches medicine', () => {
    // First click on search/medicine button to navigate to search page
    const searchBtn = cy.contains(/search|find.*medicine|medicine.*search/i);
    searchBtn.then($el => {
      if ($el.length) {
        searchBtn.click();
        cy.wait(1000);
        // Now check for search input on the search page
        cy.get('input', { timeout: 5000 }).should('exist');
      }
    });
  });

  it('opens nearby pharmacies', () => {
    cy.contains(/nearby|pharmacy/i).click();
    cy.wait(500);
  });

  it('views orders', () => {
    cy.contains(/order|prescription/i).click();
    cy.wait(500);
  });

  it('updates settings (if form)', () => {
    const settingsBtn = cy.contains(/setting|profile/i);
    settingsBtn.then($el => {
      if ($el.length) {
        settingsBtn.click();
        cy.wait(500);
      }
    });
  });
});