/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    loginAsPatient(): Chainable<void>;
    loginAsPharmacy(): Chainable<void>;
    dismissToast(): Chainable<void>;
  }
}