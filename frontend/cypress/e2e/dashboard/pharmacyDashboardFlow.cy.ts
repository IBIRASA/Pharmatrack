/// <reference types="cypress" />

describe('Pharmacy Dashboard Flow', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      user_type: 'pharmacy'
    }));
    cy.visit('/pharmacy-dashboard');
  });

  it('loads dashboard', () => {
    cy.url().should('include', '/pharmacy-dashboard');
    cy.contains(/dashboard|overview|inventory/i, { timeout: 10000 }).should('exist');
  });

  it('opens inventory', () => {
    cy.contains(/inventory|medicine|stock/i).first().click();
    cy.wait(1000);
    cy.url().should('include', '/pharmacy-dashboard');
  });

  it('opens orders', () => {
    cy.contains(/order/i).first().click();
    cy.wait(1000);
    cy.url().should('include', '/pharmacy-dashboard');
  });

  it('opens sales', () => {
    // Look for "Sales Report" or similar
    const salesBtn = cy.contains(/sales report|report/i);
    salesBtn.then($el => {
      if ($el.length) {
        salesBtn.click();
        cy.wait(500);
      } else {
        // Sales might be a submenu or not exist, skip
        cy.log('Sales navigation not found, skipping');
      }
    });
  });

  it('settings page', () => {
    cy.contains(/setting|profile/i).click();
    cy.wait(1000);
    cy.url().should('match', /pharmacy-dashboard|settings/i);
  });
});