import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    type Query {
        # this will redirect our user to Google so they can authorize our app and sign in.
        authUrl: String!
    }

    type Mutation {
        """
        our react client will fire this mutation while passing in the authorization code,
        it will then send the authorization code to the Google servers in order to retrieve
        the access token of the signed-in user.
        """
        logIn: String!
        # this will return an instance of the logged in user.
        logOut: String!
    }
`;
