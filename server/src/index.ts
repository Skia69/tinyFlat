require("dotenv").config();

import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql";
import { resolvers } from "./graphql/resolvers";
import { connectDatabase } from "./database";

const mount = async (app: Application) => {
  const db = await connectDatabase();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      db,
    }),
  });
  server.applyMiddleware({ app, path: "/api" });

  app.listen(process.env.PORT, () => {
    console.log(
      `GraphQL Playerground has been launched on.. [app]:http://localhost:${process.env.PORT}/api`
    );
  });
};

mount(express());
