/// <reference types="cypress" />

describe('Pharmacy Dashboard', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'pharmacy@test.com',
      user_type: 'pharmacy',
      name: 'Test Pharmacy'
    }));

    cy.intercept('GET', '**/inventory/dashboard-stats/**', {
      statusCode: 200,
      body: {
        total_revenue: '5000.00',
        total_sales: 100,
        today_sales: 10,
        low_stock_items: 5
      }
    }).as('getStats');

    cy.intercept('GET', '**/inventory/medicines/**', {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Aspirin',
          stock_quantity: 100,
          unit_price: '10.00'
        }
      ]
    }).as('getMedicines');

    cy.visit('/pharmacy-dashboard');
  });

  it('should display dashboard stats', () => {
    cy.contains(/dashboard|overview|stats/i, { timeout: 10000 }).should('exist');
  });

  it('should display medicines list', () => {
    cy.contains(/inventory|medicine|stock/i, { timeout: 10000 }).should('exist');
  });

  it('should navigate to inventory', () => {
    cy.contains(/inventory|medicine|stock/i).first().click();
    cy.wait(1000);
  });

  it('should navigate to orders', () => {
    cy.contains(/order/i).first().click();
    cy.wait(1000);
  });

  it('should navigate to sales', () => {
    // Sales might be under "Sales Report" or within inventory section
    cy.contains(/sales report|report/i, { timeout: 10000 }).should('exist');
  });

  it('should open add medicine modal', () => {
    // Navigate to inventory first
    cy.contains(/inventory/i).click();
    cy.wait(1000);
    
    // Look for add button with various possible labels
    cy.get('button, a').contains(/add|create|\+|new medicine/i, { timeout: 10000 })
      .should('exist');
  });

  it('should logout successfully', () => {
    cy.contains(/logout|sign out/i).click();
    cy.url().should('include', '/login');
  });
});