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

class Login extends Component {
  state = {
    password: '',
    newPassword: '',
    salt: '',
    userName: '',
    walletAddress: '',
    userEmail: '',
  };

  loginFunc = async () => {
    console.log('login begin');
    const query = `
    *[_type=="users" && email == "${this.state.userEmail}"] { email,userName, password, salt
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
        console.log('userName is', myUserInfo.userName);
        Cookies.set('loggedin', true);
        window.localStorage.setItem('username', myUserInfo.userName);
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
      email: this.userEmail,
      salt: this.state.salt,
      address: banks[banks.length - 1],
    };
    await client.create(txDoc);

    return;
  };
  callSignup = async () => {
    Router.push('/signup');
  };
  render() {
    return (
      <div className="index_page">
        {/* <img className="login_banner" src={banner} /> */}
        <div className="index_heading">
          A Better Banking System Using Blockchain
        </div>
        <div className="index_inputs">
          <input
            className="index_input_email"
            // value={this.state.userName}
            placeholder="Enter email address"
            onChange={(e) => this.setState({ userEmail: e.target.value })}
          />
          <input
            value={this.state.password}
            className="index_input_password"
            placeholder="Enter password"
            onChange={(e) => this.setState({ password: e.target.value })}
          />
        </div>

        <button className="index_button_login" onClick={() => this.loginFunc()}>
          Login
        </button>

        <div className="index_text_or">Or, if you are new: </div>

        <button
          className="index_button_signup"
          onClick={() => this.callSignup()}
        >
          Sign up
        </button>
      </div>
    );
  }
}
export default Login;
