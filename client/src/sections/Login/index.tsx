import React, { useEffect, useRef } from 'react';
import { Card, Layout, Spin, Typography } from 'antd';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { Redirect } from 'react-router-dom';

import googleLogo from './assets/google_logo.jpg';
import { Viewer } from '../../lib/types';
import { AuthUrl as AuthUrlData } from '../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl';
import { AUTH_URL } from '../../lib/graphql/queries/AuthUrl';
import { LOG_IN } from '../../lib/graphql/mutations/LogIn';
import {
  logIn as LogInData,
  logInVariables,
} from '../../lib/graphql/mutations/LogIn/__generated__/logIn';
import { displaySuccessNotification, displayErrorMessage } from '../../lib/utils';
import { ErrorBanner } from '../../lib/components';

const { Content } = Layout;
const { Text, Title } = Typography;

/* we're not returning anything since we're only interested in updating the Viewer
 with the data coming from Google api. */
interface Props {
  setViewer: (viewer: Viewer) => void;
}
export const Login = ({ setViewer }: Props) => {
  const client = useApolloClient();
  // capture the "code" received from Google api and send it to the server so that we receive a token.
  const [logIn, { data: logInData, loading: logInloading, error: logInError }] = useMutation<
    LogInData,
    logInVariables
  >(LOG_IN, {
    onCompleted: (data) => {
      if (data && data.logIn) {
        setViewer(data.logIn);
        displaySuccessNotification("You've successfully logged in!");
      }
    },
  });
  // the way this is used should be done sparingly.
  const logInRef = useRef(logIn);
  /* we'll want to run the login mutation the moment our <LogIn /> component is being rendered 
  and the "code" is available as a query parameter,
  therefore we'll make use of the useEffect hook and throw in a conditional. */
  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');
    if (code) {
      logInRef.current({
        variables: { input: { code } },
      });
    }
  }, []);

  // excute the authUrl so that it sends back a "code" from Google api.
  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<AuthUrlData>({
        query: AUTH_URL,
      });
      window.location.href = data.authUrl;
    } catch {
      displayErrorMessage("Sorry! We weren't able to log you in. Please try again later!");
    }
  };

  if (logInData && logInData.logIn) {
    const { id: viewerId } = logInData.logIn;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  if (logInloading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Logging you in..." />
      </Content>
    );
  }

  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="We weren't able to log you in. Please try again soon." />
  ) : null;

  return (
    <Content className="log-in">
      {logInErrorBannerElement}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Log in to TinyHouse!
          </Title>
          <Text>Sign in with Google to start booking available rentals!</Text>
        </div>
        <button className="log-in-card__google-button" onClick={handleAuthorize}>
          <img src={googleLogo} alt="Google Logo" className="log-in-card__google-button-logo" />
          <span className="log-in-card__google-button-text">Sign in with Google</span>
        </button>
        <Text type="secondary">
          Note: By signing in, you'll be redirected to the Google consent form to sign in with your
          Google account.
        </Text>
      </Card>
    </Content>
  );
};
