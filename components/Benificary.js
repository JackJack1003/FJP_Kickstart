import React from 'react';
import { Link } from '../routes';

function Beneficary({ _user, _address }) {
  return (
    <div>
      Beneficary: <p> {_user} </p>
      <p> {_address}</p>
      <Link route={`/campaigns/${_address}`}>
        <a> View Bank account</a>
      </Link>
    </div>
  );
}

export default Beneficary;
