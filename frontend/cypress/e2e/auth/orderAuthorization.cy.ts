// cypress/e2e/auth/orderAuthorization.cy.ts
/// <reference types="cypress" />

describe('Order Authorization - Patient Only', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('test_place_order_requires_patient - Anonymous user cannot place order', () => {
    cy.visit('/patient-dashboard');
    
    // Should redirect to login
    cy.url({ timeout: 10000 }).should('include', '/login');
  });

  it('test_place_order_requires_patient - Pharmacy user cannot place order', () => {
    // Login as pharmacy
    cy.loginAsPharmacy();
    
    // Try to access patient dashboard
    cy.visit('/patient-dashboard');
    
    // Should redirect away from patient dashboard
    cy.url({ timeout: 10000 }).then((url) => {
      expect(url).to.not.include('/patient-dashboard');
    });
  });

  it('test_place_order_requires_patient - Patient can access order features', () => {
    // Login as patient
    cy.loginAsPatient();

    cy.visit('/patient-dashboard');

    // Verify patient can see medicine search
    cy.contains(/search|medicine|find/i, { timeout: 10000 }).should('exist');
    
    // Click to navigate to medicine search
    cy.contains(/search|medicine/i).click();
    cy.wait(1000);
    
    // Verify search functionality exists (patient can use it)
    cy.get('input[type="text"], input[type="search"]', { timeout: 5000 })
      .should('exist');
  });
});