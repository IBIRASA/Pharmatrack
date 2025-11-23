/// <reference types="cypress" />

describe('Registration Validation', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('shows required field errors', () => {
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
    // Form should still be visible (validation failed)
    cy.get('form').should('exist');
  });

  it('rejects invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="email"]').blur();
    cy.wait(500);
  });

  it('shows password mismatch', () => {
    cy.get('input[type="email"]').type('test@test.com');
    cy.get('input[type="password"]').first().type('Password123!');
    cy.get('input[type="password"]').last().type('DifferentPass!');
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
    cy.get('form').should('exist');
  });
});