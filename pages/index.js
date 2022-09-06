import React, { createFactory } from 'react';
import { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
import { Router } from '../routes';
import web3 from '../ethereum/web3';

class Login extends Component {
  callCreate = async () => {
    console.log('hy het geclick');
    try {
      const accounts = await web3.eth.getAccounts();
      await factory.methods.createCampaign('0').send({ from: accounts[0] });

      Router.pushRoute('/home');
    } catch (err) {
      console.log(err);
    }
  };
  render() {
    return (
      <div>
        <Link route="/home">
          <a>
            <button>Login</button>
          </a>
        </Link>

        <button onClick={() => this.callCreate()}>Sign up</button>
      </div>
    );
  }
}
export default Login;
