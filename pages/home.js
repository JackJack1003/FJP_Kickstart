import React, { createFactory } from 'react';
import { Component } from 'react';
import { Card, Button, Placeholder } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
import BigNavBar from '../components/BigNavBar';
import { client } from '../lib/sanityClient';
import Beneficary from '../components/Benificary';
class Home extends Component {
  state = {
    searchUser: '',
    userName: '',
    userAddress: '',
  };
  static async getInitialProps() {
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
          <h3>Open bank account</h3>
          <Link route="/campaigns/new">
            <a>
              <Button
                floated="right"
                content="Add account"
                icon="add circle"
                primary
              />
            </a>
          </Link>
          <input
            onChange={(e) => {
              this.setState({ searchUser: e.target.value });
            }}
            placeholder="Search by username"
          />
          <Link route={`/campaigns/${this.state.userAddress}/history`}>
            <a>
              <button>View Transaction History</button>
            </a>
          </Link>
          <button onClick={() => this.searchFunc()}> Search</button>
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
