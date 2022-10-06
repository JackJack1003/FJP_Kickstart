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
  };
  static async getInitialProps(props) {
    const campaigns = await factory.methods.getDeployedContracts().call();

    return { campaigns };
  } //static beteken ander instances van die class inherent nie die nie

  searchFunc = async () => {
    const query = `
    *[_type=="users" && userName == "${this.state.searchUser}"] { userName, password, salt, address
    }
  `;
    const clientRes = await client.fetch(query);
    this.setState({ userName: clientRes[0].userName });
    await this.setState({ userAddress: clientRes[0].address });
    console.log('Die address wat gestoor is, is ', this.state.userAddress);
  };
  viewTrans = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('accounts is: ', accounts[0]);

    Router.push(`/campaigns/history/${accounts[0]}`);
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
          <h2>Search a Beneficary to pay</h2>
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

          <a>
            <button onClick={() => this.viewTrans()}>
              View Transaction History
            </button>
          </a>
          <Beneficary
            _user={this.state.userName}
            _address={this.state.userAddress}
          />
          {this.renderCampaigns()}
        </div>
      </Layout>
    );
  }
}
export default Home;
