import React from 'react';
import { List, Typography } from 'antd';
import { ListingCard } from '../../../../lib/components';
import { User } from '../../../../lib/graphql/queries/User/__generated__/User';

interface Props {
  userListings: User['user']['listings'];
  listingsPage: number;
  limit: number;
  setListingsPage: (page: number) => void;
}

const { Paragraph, Title } = Typography;

export const UserListings = ({ userListings, listingsPage, limit, setListingsPage }: Props) => {
  const { total, result } = userListings; // destruct the total and result.

  const userListingsList = (
    <List
      grid={{ gutter: 8, xs: 1, sm: 2, lg: 4 }}
      dataSource={result}
      locale={{ emptyText: "User doesn't have any listings yet!" }}
      pagination={{
        position: 'top',
        current: listingsPage, // the current page.
        total, //  the total number of items to be paginated.
        defaultPageSize: limit,
        hideOnSinglePage: true,
        showLessItems: true, // only the pages around the current page and the boundary pages will be shown.
        onChange: (page: number) => setListingsPage(page),
      }} // takes every items within the data source.
      renderItem={(userListing) => (
        <List.Item>
          <ListingCard listing={userListing} />
        </List.Item>
      )}
    />
  );

  return (
    <div className="user-listings">
      <Title level={4} className="user-listings__title">
        Listings
      </Title>
      <Paragraph className="user-listings__description">
        This section highlights the listings this user currently hosts and has made available for
        bookings.
      </Paragraph>
      {userListingsList}
    </div>
  );
};
