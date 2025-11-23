/// <reference types="cypress" />

describe('Landing Page', () => {
  beforeEach(() => {
    cy.clearTestData();
    cy.visit('/');
  });

  it('should load successfully', () => {
    cy.url().should('include', '/');
    cy.get('body').should('be.visible');
  });

  it('should display header with logo and navigation', () => {
    cy.get('header').should('exist');
    cy.contains(/pharmatrack|home/i).should('be.visible');
  });

  it('should display hero section', () => {
    cy.get('h1, h2').should('be.visible');
    cy.contains(/welcome|track|manage/i).should('exist');
  });

  it('should have working navigation links', () => {
    cy.get('a[href*="login"]').should('exist');
    cy.get('a[href*="register"]').should('exist');
  });

  it('should navigate to login page', () => {
    cy.contains(/login|sign in/i).click();
    cy.url().should('include', '/login');
  });

  it('should navigate to register page', () => {
    cy.contains(/register|sign up/i).click();
    cy.url().should('include', '/register');
  });

  it('should display features section', () => {
    cy.contains(/features|services|about/i).should('be.visible');
  });

  it('should display footer', () => {
    cy.get('footer').should('exist');
  });

  it('should be responsive on mobile', () => {
    cy.viewport('iphone-x');
    cy.get('body').should('be.visible');
  });

  it('should be responsive on tablet', () => {
    cy.viewport('ipad-2');
    cy.get('body').should('be.visible');
  });
});