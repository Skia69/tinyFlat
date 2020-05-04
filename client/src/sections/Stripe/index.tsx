import React, { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Layout, Spin } from 'antd';
import { CONNECT_STRIPE } from '../../lib/graphql/mutations';
import {
  ConnectStripe as ConnectStripeData,
  ConnectStripeVariables,
} from '../../lib/graphql/mutations/ConnectStripe/__generated__/ConnectStripe';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { Viewer } from '../../lib/types';
import { displaySuccessNotification } from '../../lib/utils';

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;

export const Stripe = ({ viewer, setViewer, history }: Props & RouteComponentProps) => {
  const [connectStripe, { loading, data, error }] = useMutation<
    ConnectStripeData,
    ConnectStripeVariables
  >(CONNECT_STRIPE, {
    onCompleted: (data) => {
      if (data?.connectStripe) {
        setViewer({ ...viewer, hasWallet: data.connectStripe.hasWallet });
        displaySuccessNotification(
          "You've successfully connected your Stripe Account!",
          'You can now begin to create listings in the Host page.',
        );
      }
    },
  });
  /* we want the Stripe component to render once while keeping the same copy of the connectStripe function,
  and have the mutation run once as well. */
  const connectStripeRef = useRef(connectStripe);

  // extract the code from URL then run the connectStripe function when the component first mounts.
  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');

    if (code) {
      connectStripeRef.current({
        variables: { input: { code } },
      });
    } else {
      /* if the user visits the "/stripe" route manually they'll get blank page because there won't be a "code" in the URL which means the mutation won't fire, so we'll redirect them. */
      history.replace('/login');
    }
  }, [history]);

  if (loading) {
    return (
      <Content className="stripe">
        <Spin size="large" tip="Connecting your Stripe account..." />
      </Content>
    );
  }

  if (data?.connectStripe) {
    return <Redirect to={`/user/${viewer.id}`} />;
  }

  // redirect the user to their profile page and show em useful url prompt.
  if (error) {
    return <Redirect to={`/user/${viewer.id}?stripe_error=true`} />;
  }

  return null;
};
