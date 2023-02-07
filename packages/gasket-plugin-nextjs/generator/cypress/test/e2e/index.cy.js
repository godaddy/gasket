/* eslint-disable */

describe('IndexPage', () => {
  it('renders page', () => {
    cy.visit('/');
    cy.get('h1').contains('Welcome to Gasket!');
  });
});
