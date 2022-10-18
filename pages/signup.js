import React, { createFactory } from 'react';
import { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
import web3 from '../ethereum/web3';
import { Mongoose } from 'mongoose';
import { client } from '../lib/sanityClient';
import Router from 'next/router';
import Cookies from 'js-cookie';
// import banner from './login_Banner.jpg';

var crypto = require('crypto');

class Signup extends Component {
  state = {
    password: '',
    newPassword: '',
    salt: '',
    userName: '',
    walletAddress: '',
    userEmail: '',
  };

  saveUser = async () => {
    const accounts = await web3.eth.getAccounts();
    await factory.methods.createCampaign('0').send({ from: accounts[0] });
    const banks = await factory.methods.getDeployedContracts().call();
    const txDoc = {
      _type: 'users',
      userName: this.state.userName,
      password: this.state.newPassword,
      email: this.state.userEmail,
      salt: this.state.salt,
      address: banks[banks.length - 1],
    };
    await client.create(txDoc);

    return;
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

    const query = `
    *[_type=="users" && email == "${this.state.userEmail}"] { email,userName, password, salt
    }
  `;
    const query2 = `
  *[_type=="users" && userName == "${this.state.userName}"] { email,userName, password, salt
  }
`;
    const clientRes = await client.fetch(query);
    const clientRes2 = await client.fetch(query2);
    if (clientRes.length <= 0 && clientRes2.length <= 0) {
      //skep nuwe account
      try {
        //save user
        this.saveUser().then((response) => {
          Cookies.set('loggedin', true);
          Router.push(`/home`);
        });
      } catch (err) {
        console.log(err);
      }
    } else
      window.alert(
        'Username and Email should be Unique. Try logging in instead'
      );
  };
  render() {
    return (
      <div className="index_page">
        {/* <img className="login_banner" src={banner} /> */}
        <div className="index_heading">
          A Better Banking System Using Blockchain
        </div>
        <div className="signup_inputs">
          <input
            className="signup_input_email"
            // value={this.state.userName}
            placeholder="Enter email address"
            onChange={(e) => this.setState({ userEmail: e.target.value })}
          />
          <input
            className="signup_input_username"
            // value={this.state.userName}
            placeholder="Enter username"
            onChange={(e) => this.setState({ userName: e.target.value })}
          />
          <input
            value={this.state.password}
            className="signup_input_password"
            placeholder="Enter password"
            onChange={(e) => this.setState({ password: e.target.value })}
          />
        </div>

        <button
          className="signup_button_signup"
          onClick={() => this.callCreate()}
        >
          Sign up
        </button>
      </div>
    );
  }
}
export default Signup;
