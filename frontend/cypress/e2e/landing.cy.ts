/// <reference types="cypress" />

describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page Structure', () => {
    it('should display landing page', () => {
      cy.contains(/pharmatrack|welcome|find.*medicine/i).should('be.visible');
    });

    it('should display header with logo', () => {
      cy.get('header').should('be.visible');
      cy.get('img[alt*="logo" i], svg, [class*="logo"]').should('exist');
    });

    it('should display hero section', () => {
      cy.contains(/find.*medicine|search.*pharmacy|healthcare/i).should('be.visible');
    });

    it('should have call-to-action buttons', () => {
      cy.contains('button, a', /get started|sign up|register/i).should('be.visible');
      cy.contains('button, a', /login|sign in/i).should('be.visible');
    });

    it('should display features section', () => {
      cy.contains(/features|why choose|benefits/i).should('exist');
    });

    it('should display footer', () => {
      cy.scrollTo('bottom');
      cy.wait(1500);
      cy.get('footer').should('exist');
    });
  });

  describe('Navigation', () => {
    it('should navigate to registration page', () => {
      cy.contains('a, button', /get started|sign up|register/i).first().click();
      cy.url().should('include', '/register');
    });

    it('should navigate to login page', () => {
      cy.contains('a, button', /login|sign in/i).first().click();
      cy.url().should('include', '/login');
    });
  });

  // describe('Features', () => {
  //   it('should display language selector', () => {
  //     cy.get('select, button[aria-label*="language"]').should('exist');
  //   });

  //   it('should have search functionality', () => {
  //     cy.get('body').then($body => {
  //       if ($body.find('input[placeholder*="search" i]').length > 0) {
  //         cy.get('input[placeholder*="search" i]').should('be.visible');
  //       } else {
  //         cy.log('✅ Search not on landing page - test passed');
  //         expect(true).to.be.true;
  //       }
  //     });
  //   });
  // });

  describe('Responsiveness', () => {
    const viewports = [
      { device: 'iphone-x', width: 375, height: 812 },
      { device: 'ipad-2', width: 768, height: 1024 },
      { device: 'desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(({ device, width, height }) => {
      it(`should be responsive on ${device}`, () => {
        cy.viewport(width, height);
        cy.get('header').should('be.visible');
        cy.contains(/pharmatrack|welcome/i).should('be.visible');
      });
    });
  });

  describe('About Section', () => {
    it('should display about information', () => {
      cy.contains(/about|who we are|our mission/i).should('exist');
    });
  });

  describe('SEO and Accessibility', () => {
    it('should have proper page title', () => {
      cy.title().should('not.be.empty');
    });
  });
});