import React, { createFactory } from 'react';
import { Component } from 'react';
import { Card, Button, Placeholder } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
import BigNavBar from '../components/BigNavBar';
import { client } from '../lib/sanityClient';
import Beneficary from '../components/Benificary';
import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';
import Router from 'next/router';
import { useEffect } from 'react';
class Home extends Component {
  state = {
    searchUser: '',
    userName: '',
    userAddress: '',
    manager: '',
    historyAddress: '',
  };
  static async getInitialProps(props) {
    const campaigns = await factory.methods.getDeployedContracts().call();
    const banks = await factory.methods.getDeployedContracts().call();
    //await this.setState({ historyAddress: banks[banks.length - 1] });
    return { campaigns };
  } //static beteken ander instances van die class inherent nie die nie

  searchFunc = async () => {
    const query = `
    *[_type=="users" && userName == "${this.state.searchUser}"] { userName, password, salt, address
    }
  `;
    const clientRes = await client.fetch(query);
    if (clientRes.length > 0) {
      this.setState({ userName: clientRes[0].userName });
      await this.setState({ userAddress: clientRes[0].address });
      console.log('Address is: ', clientRes[0].address);
      //window.localStorage.setItem('address', clientRes[0].address);
      // Router.push(`/campaigns/${clientRes[0].address}`);
    } else {
      window.alert('This user does not exist');
    }
  };
  viewTrans = async () => {
    const query = `
    *[_type=="users" && userName == "${window.localStorage.getItem(
      'username'
    )}"] { userName, password, salt, address
    }
  `;
    const clientRes = await client.fetch(query);
    this.setState({ historyAddress: clientRes[0].address });
    console.log('Address is: ', clientRes[0].address);
    window.localStorage.setItem('address', clientRes[0].address);
    Router.push(`/campaigns/history`);
  };

  renderCampaigns() {
    const items = this.props.campaigns.map((address) => {
      return {
        header: address,
        description: (
          <Link route={`/campaigns/${address}`}>
            <a> View Bank account</a>
          </Link>
        ),
        fluid: true,
      };
    });
  }
  render() {
    return (
      <Layout>
        <BigNavBar />
        <div>
          <div className="home_heading">
            <h2>Search a Beneficary to pay</h2>
          </div>
          <div className="home_box">
            <div className="home_Search">
              <input
                onChange={(e) => {
                  this.setState({ searchUser: e.target.value });
                }}
                placeholder="Search by username"
              />
              <button
                className="loans_Withdraw_Button"
                onClick={() => this.searchFunc()}
              >
                {' '}
                Search
              </button>
            </div>
          </div>
          <div className="home_trans_his">
            <button onClick={() => this.viewTrans()}>
              {/* <button onClick={() => this.viewTrans()}> */}
              View Transaction History
            </button>
          </div>
          <div className="home_beneficary">
            <Beneficary
              _user={this.state.userName}
              _address={this.state.userAddress}
            />
            {this.renderCampaigns()}
          </div>
        </div>
      </Layout>
    );
  }
}
export default Home;
