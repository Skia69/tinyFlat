/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { logInInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: logIn
// ====================================================

export interface logIn_logIn {
  __typename: "Viewer";
  id: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface logIn {
  /**
   * our react client will fire this mutation while passing in the authorization
   * code received when we already have been redirected to the Google sign-in form,
   * it will then exchange this code with Google servers and obtain an access token
   * of the signed-in user which can be used to interact with Google api.
   */
  logIn: logIn_logIn;
}

export interface logInVariables {
  input?: logInInput | null;
}
