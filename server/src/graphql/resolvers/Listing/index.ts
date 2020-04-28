import { IResolvers } from 'apollo-server-express';
import { Request } from 'express';
import { authorize } from './../../../lib/utils';
import { Listing, Database, User } from '../../../lib/types';
import { ListingArgs, ListingBookingsArgs, ListingBookingsData } from './types';
import { ObjectId } from 'mongodb';

export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request },
    ): Promise<Listing> => {
      try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("listing can't be found");
        }
        // authorize the actual owner so that they may see the bookings.
        const viewer = await authorize(db, req);
        if (viewer?._id === listing.host) {
          listing.authroized = true;
        }

        return listing;
      } catch (error) {
        throw new Error(`Failed to query listing: ${error}`);
      }
    },
  },

  Listing: {
    id: (listing: Listing): string => listing._id.toString(),
    host: async (listing: Listing, _args: {}, { db }: { db: Database }): Promise<User | null> => {
      const host = await db.users.findOne({ _id: listing.host });
      if (!host) {
        throw new Error("host can't be found");
      }
      return host;
    },
    //the client will receive the bookingsIndex as a string and we'll parse it to get the object we're looking for.
    bookingsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.bookingsIndex);
    },
    bookings: async (
      listing: Listing,
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database },
    ): Promise<ListingBookingsData | null> => {
      try {
        if (!listing.authroized) {
          return null;
        }

        const data: ListingBookingsData = { total: 0, result: [] };

        let cursor = await db.bookings.find({ _id: { $in: listing.bookings } });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query listing bookings: ${error}`);
      }
    },
  },
};
