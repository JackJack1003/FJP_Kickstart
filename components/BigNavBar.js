import React from 'react';
import { Link } from '../routes';

function BigNavBar() {
  return (
    <div>
      BigNavBar
      <Link route="/home">
        <button> Transactions </button>
      </Link>
      <Link route="/exchange">
        <button> Exchange </button>
      </Link>
      <Link route="/stake">
        <button> Stake </button>
      </Link>
    </div>
  );
}

export default BigNavBar;
