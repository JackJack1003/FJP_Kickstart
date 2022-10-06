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
              <a>{message}</a>
              <p>
                {' '}
                {_user} {_address}
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
