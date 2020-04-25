import { gql } from 'apollo-boost';

export const LOG_IN = gql`
  mutation LogIn($input: logInInput) {
    logIn(input: $input) {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
