import { IResolvers } from 'apollo-server-express';
import { Request } from 'express';
import { authorize } from './../../../lib/utils';
import { Google } from '../../../lib/api';
import { Listing, Database, User } from '../../../lib/types';
import {
  ListingArgs,
  ListingBookingsArgs,
  ListingBookingsData,
  ListingsArgs,
  ListingsData,
  ListingsFilter,
  ListingsQuery,
} from './types';
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
    listings: async (
      _root: undefined,
      { location, filter, limit, page }: ListingsArgs,
      { db }: { db: Database },
    ): Promise<ListingsData> => {
      // this query will be used to search for listings based on location.
      const query: ListingsQuery = {};

      try {
        const data: ListingsData = {
          region: null,
          total: 0,
          result: [],
        };
        /* check if the location argument exists (since it won't be needed everywhere on the client)
        and if it does we'll run the Google geocode() method and pass in the location value */
        if (location) {
          const { country, admin, city } = await Google.geocode(location);
          // the main focus here is the country, it doesn't exist we'll throw an error.
          if (city) query.city = city;
          if (admin) query.admin = admin;
          if (country) {
            query.country = country;
          } else {
            throw new Error('no country found');
          }
          // this is to be displayed on the client in case a location is found.
          const cityText = city ? `${city}, ` : '';
          const adminText = admin ? `${admin}, ` : '';
          data.region = `${cityText}${adminText}${country}`;
        }

        let cursor = await db.listings.find(query);

        if (filter && filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
          cursor = cursor.sort({ price: 1 });
        }

        if (filter && filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
          cursor = cursor.sort({ price: -1 });
        }

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query listings: ${error}`);
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