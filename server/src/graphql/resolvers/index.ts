import merge from 'lodash.merge';
import { useResolvers } from './User';
import { viewerResolvers } from './Viewer';

export const resolvers = merge(useResolvers, viewerResolvers);
