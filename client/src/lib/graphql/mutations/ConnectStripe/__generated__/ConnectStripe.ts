/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ConnectStripeInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: ConnectStripe
// ====================================================

export interface ConnectStripe_connectStripe {
  __typename: "Viewer";
  hasWallet: boolean | null;
}

export interface ConnectStripe {
  /**
   * this will have a similar flow as the Google OAuth login flow with the
   * exception that with Stripe, we'll be able to create the URL on the client to
   * take the user to the consent form to log in so we won't need to have a query
   * or mutation for this.
   */
  connectStripe: ConnectStripe_connectStripe;
}

export interface ConnectStripeVariables {
  input: ConnectStripeInput;
}
