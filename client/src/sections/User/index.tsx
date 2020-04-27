import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Layout, Row, Col } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import { USER } from '../../lib/graphql/queries';
import { User as UserData, UserVariables } from '../../lib/graphql/queries/User/__generated__/User';
import { PageSkeleton, ErrorBanner } from '../../lib/components';
import { Viewer } from '../../lib/types';
import { UserProfile } from './components';

interface Props {
  viewer: Viewer;
}
interface MatchParams {
  id: string;
}

const { Content } = Layout;
// we're using intersection type because there are 2 interfaces.
export const User = ({ viewer, match }: Props & RouteComponentProps<MatchParams>) => {
  const { data, loading, error } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id, // extract the id from the url.
    },
  });

  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="user">
        <ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const user = data ? data.user : null; // check if the user exists.
  const viewerIsUser = viewer.id === match.params.id; // check if the viewer is actually the user itself.

  const userProfileElement = user ? <UserProfile user={user} viewerIsUser={viewerIsUser} /> : null;

  return (
    <Content className="user">
      <Row gutter={12} justify="space-between">
        <Col xs={24}>{userProfileElement}</Col>
      </Row>
    </Content>
  );
};
