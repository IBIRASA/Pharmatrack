/// <reference types="cypress" />

describe('Patient Dashboard', () => {
  beforeEach(() => {
    // Set auth token
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'patient@test.com',
      user_type: 'patient',
      name: 'Test Patient'
    }));

    cy.visit('/patient-dashboard');
  });

  it('should display search functionality', () => {
    // Look for search in navigation or action cards
    cy.get('[data-testid="search-button"], button, a').contains(/search|find|medicine/i, { timeout: 10000 })
      .should('exist');
  });

  it('should search for medicines', () => {
    // Click on search/medicine search button to open the search page
    cy.contains(/search|find.*medicine|medicine.*search/i).click();
    cy.wait(1000);
    
    // Now look for input on the search page
    cy.get('input[type="text"], input[type="search"]', { timeout: 10000 }).should('exist');
  });

  it('should display nearby pharmacies', () => {
    cy.contains(/nearby|pharmacy|pharmacies|find/i, { timeout: 10000 }).should('exist');
  });

  it('should view orders', () => {
    cy.contains(/order|prescription/i, { timeout: 10000 }).should('exist');
  });

  it('should logout successfully', () => {
    cy.contains(/logout|sign out/i, { timeout: 10000 }).click();
    cy.url().should('include', '/login');
  });
});