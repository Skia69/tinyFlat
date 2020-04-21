import { gql } from 'apollo-boost';

export const LOG_OUT = gql`
  mutation logOut {
    logOut {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
