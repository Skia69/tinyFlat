import merge from 'lodash.merge';
import { bookingResolver } from './Booking';
import { listingResolvers } from './Listing/index';
import { useResolvers } from './User';
import { viewerResolvers } from './Viewer';

export const resolvers = merge(bookingResolver, listingResolvers, useResolvers, viewerResolvers);
