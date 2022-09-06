import React from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from '../routes';

const Header = () => {
  return (
    <div>
      <Menu style={{ marginTop: '10px' }}>
        <Link route="/">
          <a className="item">A Better Banking System with Blockchain</a>
        </Link>

        <Menu.Menu position="right">
          <Menu.Item>Banking</Menu.Item>
          <Link route="/campaigns/new">
            <a className="item">+</a>
          </Link>
        </Menu.Menu>
      </Menu>
    </div>
  );
};

export default Header;
