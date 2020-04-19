import { Collection, ObjectID } from "mongodb";

export interface Booking {
  _id: ObjectID;
}
export interface Listing {
  _id: ObjectID;
}

export interface User {
  _id: ObjectID;
}

export interface Database {
  listings: Collection<Listing>;
  users: Collection<User>;
  bookings: Collection<Booking>;
}
