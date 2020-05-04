import { Request } from 'express';
import { Database, User } from '../types';

// We're saying null instead of undefined since the findOne() will either return a document or null.
export const authorize = async (db: Database, req: Request): Promise<User | null> => {
  // send the token with every request header.
  const token = req.get('X-CSRF-TOKEN');
  // check whether the cookie and token belong to an existing user in the database.
  const viewer = await db.users.findOne({ _id: req.signedCookies.viewer, token });

  return viewer;
};
