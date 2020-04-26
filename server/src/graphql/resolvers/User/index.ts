import { Request } from 'express';
import { IResolvers } from 'apollo-server-express';
import { User, Database } from '../../../lib/types';
import { authorize } from '../../../lib/utils';
import {
  UserArgs,
  UserBookingsArgs,
  UsersBookingsData,
  UserListingsArgs,
  UserListingsData,
} from './types';

export const useResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined,
      { id }: UserArgs,
      { db, req }: { db: Database; req: Request },
    ): Promise<User> => {
      try {
        const user = await db.users.findOne({ _id: id });

        if (!user) {
          throw new Error("user can't be found");
        }

        const viewer = await authorize(db, req);
        /* check to see if this viewer exists and we'll check to see if the _id field of this viewer object matches that of the user being queried. If so, we'll authorize the user. */
        if (viewer?._id === user._id) {
          user.authorized = true;
        }

        return user;
      } catch (error) {
        throw new Error(`Failed to query user: ${error}`);
      }
    },
  },
  User: {
    id: (user: User): string => user._id,
    hasWallet: (user: User): boolean => Boolean(user.walletId),
    // user has to be authorized first.
    income: (user: User): number | null => (user.authorized ? user.income : null),
    bookings: async (
      user: User,
      { limit, page }: UserBookingsArgs,
      { db }: { db: Database },
    ): Promise<UsersBookingsData | null> => {
      try {
        // check is the user is authorized first since the user bookings is a sensitive data.
        if (!user.authorized) {
          return null;
        }
        // initial bookings data.
        const data: UsersBookingsData = { total: 0, result: [] };
        // find all the bookings where the _id field is in the user bookings array.
        let cursor = await db.bookings.find({
          _id: { $in: user.bookings },
        });
        /* If page is 1 and limit is 10, we don't skip anything since we're on the first page. If page is 2 and limit is 10, we skip the first 10 documents. And so on... */
        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit); // limit the number of bookings displayed.

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query user bookings: ${error}`);
      }
    },
    listings: async (
      user: User,
      { limit, page }: UserListingsArgs,
      { db }: { db: Database },
    ): Promise<UserListingsData | null> => {
      try {
        const data: UserListingsData = { total: 0, result: [] };

        let cursor = await db.listings.find({
          _id: { $in: user.listings },
        });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query user listings: ${error}`);
      }
    },
  },
};
