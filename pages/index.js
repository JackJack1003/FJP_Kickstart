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

var crypto = require('crypto');

class Login extends Component {
  state = {
    password: '',
    newPassword: '',
    salt: '',
    userName: '',
    walletAddress: '',
  };

  loginFunc = async () => {
    console.log('login begin');
    const query = `
    *[_type=="users" && userName == "${this.state.userName}"] { userName, password, salt
    }
  `;
    const clientRes = await client.fetch(query);
    console.log('Client res is', clientRes);
    if (clientRes.length <= 0) {
      window.alert('User does not exist, sign up instead');
    } else {
      let myUserInfo = clientRes[0];
      console.log(myUserInfo);
      const dbSalt = myUserInfo.salt;
      const dbPass = myUserInfo.password;
      await this.setState({
        newPassword: crypto
          .pbkdf2Sync(this.state.password, dbSalt, 1000, 64, `sha512`)
          .toString(`hex`),
      });
      const myNewPassword = await crypto
        .pbkdf2Sync(this.state.password, dbSalt, 1000, 64, `sha512`)
        .toString(`hex`);
      console.log(dbPass);
      console.log(myNewPassword);
      if (myNewPassword == dbPass) {
        console.log('Password match');
        Cookies.set('loggedin', true);
        Router.push(`/home`);
      } else {
        window.alert('Username and password do not match');
      }
    }
  };

  saveUser = async () => {
    const accounts = await web3.eth.getAccounts();
    await factory.methods.createCampaign('0').send({ from: accounts[0] });
    const banks = await factory.methods.getDeployedContracts().call();
    const txDoc = {
      _type: 'users',
      userName: this.state.userName,
      password: this.state.newPassword,
      email: 'jack@coetzer.co.za',
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
    *[_type=="users" && userName == "${this.state.userName}"] { userName, password, salt
    }
  `;
    const clientRes = await client.fetch(query);
    if (clientRes.length <= 0) {
      //skep nuwe account
      try {
        //save user
        this.saveUser().then((response) => {
          console.log(response);
          Cookies.set('loggedin', true);
          Router.push(`/home`);
        });
      } catch (err) {
        console.log(err);
      }
    }
  };
  render() {
    return (
      <div className="index_page">
        <div className="index_heading">
          A Better Banking System Using Blockchain
        </div>
        <input
          className="index_input_username"
          value={this.state.userName}
          placeholder="Enter username"
          onChange={(e) => this.setState({ userName: e.target.value })}
        />
        <input
          value={this.state.password}
          className="index_input_password"
          placeholder="Enter password"
          onChange={(e) => this.setState({ password: e.target.value })}
        />

        <button className="index_button_login" onClick={() => this.loginFunc()}>
          Login
        </button>

        <div className="index_text_or">Or...</div>

        <button
          className="index_button_signup"
          onClick={() => this.callCreate()}
        >
          Sign up
        </button>
      </div>
    );
  }
}
export default Login;
