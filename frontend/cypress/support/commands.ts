/// <reference types="cypress" />

Cypress.Commands.add('loginAsPatient', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/login');
  cy.get('input[type="email"], input#email, input[name="email"]').clear().type('patient@test.com');
  cy.get('input[type="password"], input#password, input[name="password"]').clear().type('password123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/patient-dashboard', { timeout: 10000 });
  cy.wait(3000);
});

Cypress.Commands.add('loginAsPharmacy', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/login');
  cy.get('input[type="email"], input#email, input[name="email"]').clear().type('pharmacy@test.com');
  cy.get('input[type="password"], input#password, input[name="password"]').clear().type('password123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/pharmacy-dashboard', { timeout: 10000 });
  cy.wait(3000);
});

Cypress.Commands.add('dismissToast', () => {
  cy.wait(3000);
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsPatient(): Chainable<void>;
      loginAsPharmacy(): Chainable<void>;
      dismissToast(): Chainable<void>;
    }
  }
}

export {};