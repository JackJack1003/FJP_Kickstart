import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import ContributeForm from '../../components/ContributeForm';
import Layout from '../../components/Layout';
import Campaign from '../../ethereum/campaign';
import web3 from '../../ethereum/web3';
import { Link } from '../../routes';
import BigNavBar from '../../components/BigNavBar';

class CampaignShow extends Component {
  static async getInitialProps(props) {
    const campaign = Campaign(props.query.address);

    const summary = await campaign.methods.getSummary().call();

    return {
      address: props.query.address,
      minimumContribution: summary[0],
      balance: summary[1],
      requestsCount: summary[2],
      approversCount: summary[3],
      manager: summary[4],
    };
  }

  renderCards() {
    const {
      balance,
      manager,
      minimumContribution,
      requestsCount,
      approversCount,
    } = this.props;

    const items = [
      {
        header: manager,
        meta: 'Address of Account',
      },

      {
        header: web3.utils.fromWei(balance, 'ether'),
        meta: 'Balance for account',
      },
    ];

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <BigNavBar />

        <div className="show">
          <h3>Viewing Bank account</h3>
        </div>
        <div className="show_info">{this.renderCards()}</div>

        <div className="show_contribute">
          <ContributeForm address={this.props.address} />
        </div>
      </Layout>
    );
  }
}

export default CampaignShow;
