import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/react-hooks';
import { LogOut as LogOutData } from '../../../../lib/graphql/mutations/LogOut/__generated__/logOut';
import { LOG_OUT } from '../../../../lib/graphql/mutations';
import { displaySuccessNotification, displayErrorMessage } from '../../../../lib/utils';
import { Viewer } from '../../../../lib/types';

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Item, SubMenu } = Menu;

export const MenuItems = ({ viewer, setViewer }: Props) => {
  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: (data) => {
      if (data?.logOut) {
        setViewer(data.logOut); // update the viewer object.
        sessionStorage.removeItem('token'); // remove the token from the sessionStorage.
        displaySuccessNotification("You've successfully logged out!");
      }
    },
    onError: () =>
      displayErrorMessage("Sorry! We weren't able to log you out. Please try again later!"),
  });

  const handleLogOut = () => {
    logOut();
  };
  // show the dropdown menu if the user is logged in.
  const subMenuLogin =
    viewer.id && viewer.avatar ? (
      <SubMenu title={<Avatar src={viewer.avatar} />}>
        <Item key={`/user/${viewer.id}`}>
          <Link to={`/user/${viewer.id}`}>
            <UserOutlined />
            Profile
          </Link>
        </Item>
        <Item key="/logout">
          <div onClick={handleLogOut}>
            <LogoutOutlined />
            Log out
          </div>
        </Item>
      </SubMenu>
    ) : (
      <Item>
        <Link to="/login">
          <Button type="primary">Sign In</Button>
        </Link>
      </Item>
    );

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <HomeOutlined />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};
