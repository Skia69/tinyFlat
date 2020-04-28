import { IResolvers } from 'apollo-server-express';
import { Booking, Database, Listing } from '../../../lib/types';

export const bookingResolver: IResolvers = {
  Booking: {
    id: (booking: Booking): string => booking._id.toString(),
    // In the booking document in our database, we store listing as an id value but in the client we expect a listing object.
    listing: (booking: Booking, _args: {}, { db }: { db: Database }): Promise<Listing | null> => {
      return db.listings.findOne({ _id: booking.listing });
    },
  },
};
