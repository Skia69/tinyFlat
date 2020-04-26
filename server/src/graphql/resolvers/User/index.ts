import { IResolvers } from 'apollo-server-express';

export const useResolvers: IResolvers = {
  Query: {
    user: () => 'user.String',
  },
};
