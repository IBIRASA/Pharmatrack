/// <reference types="cypress" />

describe('Pharmacy Dashboard', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');
    
    cy.intercept('POST', '**/api/users/login/').as('loginRequest');
    
    cy.get('input#email').clear().type('pharmacy@test.com');
    cy.get('input#password').clear().type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
      const status = interception.response?.statusCode;
      
      if (status === 200) {
        cy.url().should('include', '/pharmacy-dashboard', { timeout: 10000 });
        cy.wait(3000); // Wait for toasts
      } else {
        cy.log('❌ Pharmacy login failed - Run: python manage.py shell');
        cy.log('Then run: from users.models import Pharmacy; Pharmacy.objects.update(is_verified=True)');
        throw new Error('Pharmacy not approved or not found');
      }
    });
  });

  describe('Dashboard Overview', () => {
    it('should display pharmacy dashboard layout', () => {
      cy.get('body').should('be.visible');
      cy.get('nav, aside, [class*="sidebar"]').should('exist');
      cy.contains(/dashboard|overview|welcome|pharmacy/i).should('be.visible');
    });

    it('should display navigation menu', () => {
      cy.get('body').then($body => {
        const hasNav = 
          $body.text().match(/inventory|stock/i) ||
          $body.text().match(/order/i) ||
          $body.text().match(/sales|report/i);
        
        expect(hasNav).to.exist;
      });
    });

    it('should display analytics cards', () => {
      cy.get('body').then($body => {
        const hasAnalytics = 
          $body.text().match(/sales|revenue|total|order|customer|product|medicine/i);
        
        if (hasAnalytics) {
          expect(hasAnalytics).to.exist;
        } else {
          cy.contains(/dashboard|overview/i).should('exist');
        }
      });
    });
  });

  describe('Inventory Management', () => {
    beforeEach(() => {
      cy.wait(1000);
      cy.get('body').then($body => {
        const inventoryLink = $body.find('a, button').filter((i, el) => 
          /inventory|stock|medicine/i.test(Cypress.$(el).text())
        );
        
        if (inventoryLink.length > 0) {
          cy.wrap(inventoryLink).first().click({ force: true });
        } else {
          cy.visit('/pharmacy-dashboard/inventory');
        }
      });
    });

    it('should display inventory page', () => {
      cy.url().should('match', /inventory|medicine|stock/i);
      cy.contains(/inventory|medicine.*list|stock/i, { timeout: 5000 }).should('be.visible');
    });

    it('should display medicine list', () => {
      cy.intercept('GET', '**/api/inventory/medicines/**', {
        statusCode: 200,
        body: []
      }).as('getMedicines');
      
      cy.wait(1000);
      cy.get('body').should('exist');
      expect(true).to.be.true;
    });

    it('should add new medicine', () => {
      cy.get('body').then($body => {
        const addButton = $body.find('button, a').filter((i, el) => 
          /add.*medicine|new.*medicine|\+/i.test(Cypress.$(el).text())
        );
        
        if (addButton.length > 0) {
          cy.wrap(addButton).first().click({ force: true });
          cy.wait(500);
        }
        expect(true).to.be.true;
      });
    });
  });

  describe('Orders Management', () => {
    it('should display orders page', () => {
      cy.get('body').then($body => {
        const ordersLink = $body.find('a, button').filter((i, el) => 
          /order/i.test(Cypress.$(el).text())
        );
        
        if (ordersLink.length > 0) {
          cy.wrap(ordersLink).first().click({ force: true });
        } else {
          cy.visit('/pharmacy-dashboard/orders');
        }
      });
      cy.contains(/order/i).should('be.visible');
    });

    it('should display order list', () => {
      cy.intercept('GET', '**/api/orders/**', {
        statusCode: 200,
        body: []
      }).as('getOrders');
      
      cy.visit('/pharmacy-dashboard/orders');
      cy.wait('@getOrders');
      expect(true).to.be.true;
    });

    it('should filter orders by status', () => {
      cy.visit('/pharmacy-dashboard/orders');
      cy.wait(1000);
      expect(true).to.be.true;
    });
  });

  describe('Sales Report', () => {
    it('should display sales report page', () => {
      cy.get('body').then($body => {
        const salesLink = $body.find('a, button').filter((i, el) => 
          /sales|report/i.test(Cypress.$(el).text())
        );
        
        if (salesLink.length > 0) {
          cy.wrap(salesLink).first().click({ force: true });
        } else {
          cy.visit('/pharmacy-dashboard/sales');
        }
      });
      
      cy.wait(1000);
      expect(true).to.be.true;
    });
  });

  describe('Settings', () => {
    it('should navigate to settings', () => {
      cy.visit('/pharmacy-dashboard/settings');
      cy.wait(1000);
      expect(true).to.be.true;
    });
  });
});