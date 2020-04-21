import React from 'react';
import { render } from 'react-dom';
import * as serviceWorker from './serviceWorker';

import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { Home, Host, Listing, Listings, NotFound, User, Login } from './sections';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout } from 'antd';
import './styles/index.css';

const client = new ApolloClient({ uri: '/api' });

const App = () => {
  return (
    <Router>
      <Switch>
        <Layout id="app">
          <Route exact path={'/'} component={Home} />
          <Route exact path={'/host'} component={Host} />
          <Route exact path={'/listing/:id'} component={Listing} />
          <Route exact path={'/listings/:location?'} component={Listings} />
          <Route exact path={'/login'} component={Login} />
          <Route exact path={'/user/:id'} component={User} />
          <Route exact component={NotFound} />
        </Layout>
      </Switch>
    </Router>
  );
};

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
