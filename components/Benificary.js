import React from 'react';
import { Link } from '../routes';

function Beneficary({ _user, _address }) {
  const message = 'View Bank account';
  return (
    <div>
      <div className="benificary">
        <Link route={`/campaigns/${_address}`}>
          {_address !== '' ? (
            <div>
              <p>
                <div className="home_beneficary_username">
                  <b> Username:</b>
                  {_user}
                </div>
                <div className="home_beneficary_address">
                  <b> Address: </b> {_address}
                </div>
                <div className="home_view_account">
                  <a>
                    {' '}
                    <b> {message} </b>{' '}
                  </a>
                </div>
              </p>
            </div>
          ) : (
            <div></div>
          )}
        </Link>
      </div>
    </div>
  );
}

export default Beneficary;
