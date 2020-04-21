import { gql } from 'apollo-boost';

export const LOG_IN = gql`
  mutation logIn($input: logInInput) {
    logIn(input: $input) {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
