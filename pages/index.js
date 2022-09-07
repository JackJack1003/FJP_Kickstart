import React, { createFactory } from 'react';
import { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
import { Router } from '../routes';
import web3 from '../ethereum/web3';
var crypto = require('crypto');

class Login extends Component {
  state = {
    password: '',
    newPassword: '',
    salt: '',
  };
  callCreate = async () => {
    console.log('hy het geclick');
    try {
      // const accounts = await web3.eth.getAccounts();
      // await factory.methods.createCampaign('0').send({ from: accounts[0] });

      // //Router.pushRoute('/home');
      console.log(this.state.password);
      await this.setState({ salt: crypto.randomBytes(16).toString('hex') });
      await this.setState({
        newPassword: crypto
          .pbkdf2Sync(this.state.password, this.state.salt, 1000, 64, `sha512`)
          .toString(`hex`),
      });
      console.log(this.state.salt);
      console.log(this.state.newPassword);
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
        <input
          value={this.state.password}
          onChange={(e) => this.setState({ password: e.target.value })}
        />

        <button onClick={() => this.callCreate()}>Sign up</button>
      </div>
    );
  }
}
export default Login;
