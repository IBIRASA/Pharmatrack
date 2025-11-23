/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as a user
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to login as pharmacy
       * @example cy.loginAsPharmacy()
       */
      loginAsPharmacy(): Chainable<void>;

      /**
       * Custom command to login as patient
       * @example cy.loginAsPatient()
       */
      loginAsPatient(): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to register a new user
       * @example cy.register(userData)
       */
      register(userData: any): Chainable<void>;

      /**
       * Custom command to check if user is authenticated
       * @example cy.checkAuth()
       */
      checkAuth(): Chainable<boolean>;

      /**
       * Custom command to mock API responses
       * @example cy.mockAPI('login', { token: 'test-token' })
       */
      mockAPI(endpoint: string, response: any, statusCode?: number): Chainable<void>;

      /**
       * Custom command to wait for API call
       * @example cy.waitForAPI('getMedicines')
       */
      waitForAPI(alias: string): Chainable<void>;

      /**
       * Custom command to seed test data
       * @example cy.seedTestData()
       */
      seedTestData(): Chainable<void>;

      /**
       * Custom command to clear test data
       * @example cy.clearTestData()
       */
      clearTestData(): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"], input[type="email"]').clear().type(email);
  cy.get('input[name="password"], input[type="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
  cy.wait(1000); // Wait for navigation
});

// Login as pharmacy
Cypress.Commands.add('loginAsPharmacy', () => {
  cy.intercept('POST', '**/users/login/', {
    statusCode: 200,
    body: {
      token: 'test-pharmacy-token',
      refresh: 'test-refresh-token',
      user: {
        id: 1,
        email: 'pharmacy@test.com',
        user_type: 'pharmacy',
        name: 'Test Pharmacy',
      },
    },
  }).as('loginAPI');

  cy.login('pharmacy@test.com', 'Test@1234');
  cy.wait('@loginAPI');
});

// Login as patient
Cypress.Commands.add('loginAsPatient', () => {
  cy.intercept('POST', '**/users/login/', {
    statusCode: 200,
    body: {
      token: 'test-patient-token',
      refresh: 'test-refresh-token',
      user: {
        id: 2,
        email: 'patient@test.com',
        user_type: 'patient',
        name: 'Test Patient',
      },
    },
  }).as('loginAPI');

  cy.login('patient@test.com', 'Test@1234');
  cy.wait('@loginAPI');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  cy.visit('/');
});

// Register command
Cypress.Commands.add('register', (userData: any) => {
  cy.visit('/register');
  
  Object.keys(userData).forEach((key) => {
    cy.get(`input[name="${key}"], select[name="${key}"]`).clear().type(userData[key]);
  });
  
  cy.get('button[type="submit"]').click();
});

// Check authentication
Cypress.Commands.add('checkAuth', () => {
  return cy.window().then((win) => {
    return !!win.localStorage.getItem('token');
  });
});

// Mock API
Cypress.Commands.add('mockAPI', (endpoint: string, response: any, statusCode = 200) => {
  cy.intercept('**/api/**', (req) => {
    if (req.url.includes(endpoint)) {
      req.reply({
        statusCode,
        body: response,
      });
    }
  }).as(endpoint);
});

// Wait for API
Cypress.Commands.add('waitForAPI', (alias: string) => {
  cy.wait(`@${alias}`);
});

// Seed test data
Cypress.Commands.add('seedTestData', () => {
  cy.window().then((win) => {
    // Seed medicines
    const mockMedicines = [
      {
        id: 1,
        name: 'Test Medicine 1',
        generic_name: 'Generic 1',
        category: 'Pain Relief',
        unit_price: '10.00',
        stock_quantity: 100,
        expiry_date: '2026-12-31',
      },
      {
        id: 2,
        name: 'Test Medicine 2',
        generic_name: 'Generic 2',
        category: 'Antibiotics',
        unit_price: '20.00',
        stock_quantity: 50,
        expiry_date: '2026-06-30',
      },
    ];
    
    win.localStorage.setItem('test_medicines', JSON.stringify(mockMedicines));
  });
});

// Clear test data
Cypress.Commands.add('clearTestData', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

// Login as patient
Cypress.Commands.add('loginAsPatient', () => {
  localStorage.setItem('token', 'patient-test-token');
  localStorage.setItem('user', JSON.stringify({
    id: 1,
    email: 'patient@test.com',
    user_type: 'patient',
    name: 'Test Patient'
  }));
});

// Login as pharmacy
Cypress.Commands.add('loginAsPharmacy', () => {
  localStorage.setItem('token', 'pharmacy-test-token');
  localStorage.setItem('user', JSON.stringify({
    id: 2,
    email: 'pharmacy@test.com',
    user_type: 'pharmacy',
    name: 'Test Pharmacy',
    pharmacy_profile: {
      is_verified: true
    }
  }));
});

// Login as admin
Cypress.Commands.add('loginAsAdmin', () => {
  localStorage.setItem('token', 'admin-test-token');
  localStorage.setItem('user', JSON.stringify({
    id: 3,
    email: 'admin@pharmatrack.com',
    user_type: 'admin',
    is_staff: true
  }));
});

export {};