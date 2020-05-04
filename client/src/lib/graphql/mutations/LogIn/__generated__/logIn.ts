/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogInInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: LogIn
// ====================================================

export interface LogIn_logIn {
  __typename: "Viewer";
  id: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface LogIn {
  /**
   * our client will fire this mutation while passing in the authorization code
   * extract from the URL when we already have been redirected to the Google
   * consent form; it will then exchange this code with Google servers and obtain
   * an access token of the signed-in user which can be used to interact with People api,
   * the input is optional because the user might be able to login via the clietn cookie.
   */
  logIn: LogIn_logIn;
}

export interface LogInVariables {
  input?: LogInInput | null;
}
