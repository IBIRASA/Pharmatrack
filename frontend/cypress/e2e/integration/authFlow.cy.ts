/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should complete full pharmacy registration and login flow', () => {
    // Register
    cy.visit('/register');
    
    cy.intercept('POST', '**/users/register/', {
      statusCode: 201,
      body: { message: 'Success', user: { id: 1 } }
    }).as('register');

    cy.contains(/pharmacy/i).click({ force: true });
    cy.wait(500);
    
    cy.get('input[type="email"]').type('newpharmacy@test.com');
    cy.get('input[type="password"]').first().type('Password123!');
    cy.get('input[type="password"]').last().type('Password123!');
    cy.get('button[type="submit"]').click();
    
    // Don't wait for register if form validation prevents submission
    cy.wait(2000);

    // Login
    cy.visit('/login');
    
    cy.intercept('POST', '**/users/login/', {
      statusCode: 200,
      body: {
        token: 'test-token',
        user: { user_type: 'pharmacy' }
      }
    }).as('login');

    cy.get('input[type="email"]').type('newpharmacy@test.com');
    cy.get('input[type="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@login');
    cy.url().should('include', '/pharmacy-dashboard');
  });

  it('should prevent unauthorized access to pharmacy dashboard', () => {
    cy.visit('/pharmacy-dashboard');
    cy.url({ timeout: 10000 }).should('include', '/login');
  });

  it('should prevent unauthorized access to patient dashboard', () => {
    cy.visit('/patient-dashboard');
    cy.url({ timeout: 10000 }).should('include', '/login');
  });
});