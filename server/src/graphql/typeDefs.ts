import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Booking {
    id: ID!
    listing: Listing!
    tenant: User!
    checkIn: String!
    checkOut: String!
  }

  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  enum ListingType {
    APARTMENT
    HOUSE
  }

  type Listing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    city: String!
    bookings(limit: Int!, page: Int!): Bookings
    bookingsIndex: String!
    price: Int!
    numOfGuests: Int!
  }

  type Listings {
    total: Int!
    result: [Listing!]!
  }
  # income and bookings are protected fields for privacy reasons.
  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }
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
    # this will redirect our user to Google consent form from which we can obtain a code.
    authUrl: String!
    user(id: ID!): User!
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
