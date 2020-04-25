import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  """
  this is the actual person viewing/using our app.
  They don't have to be logged in but we still want the client to inform us that someone is viewing our app.
  Hence, every field is optional but the "didRequest".

  "id" is the actual identifier received from the People api which we'll resolve into "_id" when storing it in Mongodb.

  "hasWallet" is being used instead of "walletId" that's to be received from Stripe because we don't wanna send the actual wallet id to the client for security reasons.
  """
  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }
  #the code that is to be received after being redirected to Google auth url.
  input logInInput {
    code: String!
  }

  type Query {
    # this will redirect our user to Google so they can authorize our app and sign in.
    authUrl: String!
  }

  type Mutation {
    """
    our react client will fire this mutation while passing in the authorization code received when we already have been redirected to the Google sign-in form,
    it will then exchange this code with Google servers and obtain an access token of the signed-in user which can be used to interact with Google api.
    """
    logIn(input: logInInput): Viewer!
    # this will return an instance of the logged in user.
    logOut: Viewer!
  }
`;
