import React, { useEffect } from 'react';
import { Link } from '../routes';
import web3 from '../ethereum/web3';
import Cookies from 'js-cookie';

function BigNavBar() {
  const logOut = () => {
    Cookies.remove('loggedin');
  };
  return (
    <div>
      <div className="navBar">
        <div className="navBar_Welcome">
          {' '}
          {/* Welcome: {window.localStorage.getItem('username')} */}
        </div>
        <div className="navBar_buttonGroup">
          <Link route="/home">
            <button className="navBar_button"> Transactions </button>
          </Link>
          <Link route="/exchange">
            <button className="navBar_button"> Exchange </button>
          </Link>
          <Link route="/stake">
            <button className="navBar_button"> Stake </button>
          </Link>
          <Link route="/loans">
            <button className="navBar_button"> Loans </button>
          </Link>
          <Link route="/">
            <button className="navBar_button" onClick={() => logOut()}>
              {' '}
              Logout{' '}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BigNavBar;
