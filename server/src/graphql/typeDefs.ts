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
  # only the owner of a listing may see its bookings.
  type Listing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    country: String!
    admin: String!
    city: String!
    bookings(limit: Int!, page: Int!): Bookings
    bookingsIndex: String!
    price: Int!
    numOfGuests: Int!
  }

  type Listings {
    region: String # region exists only if a location argument value is provided.
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
  input LogInInput {
    code: String!
  }

  enum ListingsFilter {
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
  }

  input ConnectStripeInput {
    code: String!
  }

  input HostListingInput {
    title: String!
    description: String!
    image: String!
    type: ListingType!
    address: String!
    price: Int!
    numOfGuests: Int!
  }

  type Query {
    # this will redirect our user to Google consent form from which we can obtain a code.
    authUrl: String!
    user(id: ID!): User!
    listing(id: ID!): Listing!
    listings(location: String, filter: ListingsFilter!, limit: Int!, page: Int!): Listings!
  }

  type Mutation {
    """
    our client will fire this mutation while passing in the authorization code extract from the URL when we already have been redirected to the Google consent form; it will then exchange this code with Google servers and obtain an access token of the signed-in user which can be used to interact with People api,
    the input is optional because the user might be able to login via the clietn cookie.
    """
    logIn(input: LogInInput): Viewer!
    # this will return an instance of the logged in user.
    logOut: Viewer!
    """
    this will have a similar flow as the Google OAuth login flow with the exception that with Stripe, we'll be able to create the URL on the client to take the user to the consent form to log in so we won't need to have a query or mutation for this.
    """
    connectStripe(input: ConnectStripeInput!): Viewer!
    disconnectStripe: Viewer!
    hostListing(input: HostListingInput!): Listing!
  }
`;
