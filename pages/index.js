import React, { createFactory } from 'react';
import { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
import { Router } from '../routes';
import web3 from '../ethereum/web3';
import { Mongoose } from 'mongoose';
//import { MongoClient } from 'mongodb';
var crypto = require('crypto');
// const uri =
//   'mongodb+srv://admin:myMONGOslap123@fjp-cluster.o2bbxpl.mongodb.net/?retryWrites=true&w=majority';
//const client = new MongoClient(uri);
class Login extends Component {
  state = {
    password: '',
    newPassword: '',
    salt: '',
    userName: '',
  };
  loginFunc = async () => {
    console.log('login begin');
  };
  callCreate = async () => {
    console.log('hy het geclick');
    try {
      // const accounts = await web3.eth.getAccounts();
      // await factory.methods.createCampaign('0').send({ from: accounts[0] });
      console.log('call is geroep');
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
    const res = fetch('api/password/addPass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `${this.state.userName}`,
        password: `${this.state.newPassword}`,
      }),
    }).then((response) => {
      console.log(response);
      Router.pushRoute('/home');
    });
    // const data = await res.json();
    // console.log(data);
  };
  render() {
    return (
      <div>
        <Link route="/home">
          <a>
            <button onClick={() => this.loginFunc()}>Login</button>
          </a>
        </Link>
        <input
          value={this.state.userName}
          placeholder="Enter username"
          onChange={(e) => this.setState({ userName: e.target.value })}
        />
        <input
          value={this.state.password}
          placeholder="Enter password"
          onChange={(e) => this.setState({ password: e.target.value })}
        />

        <button onClick={() => this.callCreate()}>Sign up</button>
      </div>
    );
  }
}
export default Login;
