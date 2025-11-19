/// <reference types="cypress" />

describe('404 Not Found Page', () => {
  it('should display 404 page for invalid routes', () => {
    cy.visit('/invalid-route-that-does-not-exist', { failOnStatusCode: false });
    cy.contains(/404|not found|page.*not.*found/i).should('be.visible');
  });

  it('should have link to home page', () => {
    cy.visit('/invalid-route', { failOnStatusCode: false });
    cy.contains(/home|back|go back/i).should('be.visible').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should display helpful message', () => {
    cy.visit('/nonexistent', { failOnStatusCode: false });
    cy.contains(/can.*t find|doesn.*t exist|wrong/i).should('be.visible');
  });
});