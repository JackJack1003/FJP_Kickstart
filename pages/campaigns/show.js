import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import ContributeForm from '../../components/ContributeForm';
import Layout from '../../components/Layout';
import Campaign from '../../ethereum/campaign';
import web3 from '../../ethereum/web3';
import { Link } from '../../routes';

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
        meta: 'Address of Manager',
        description:
          'The manager created this banking account and can create requests to withdraw money',
        style: { overflowWrap: 'break-word' },
      },
      {
        header: minimumContribution,
        meta: 'in Wei',
        description: 'Least amount',
        style: { overflowWrap: 'break-word' },
      },
      // {
      //   header: requestsCount,
      //   meta: 'How many requests',
      //   description: 'Requests must be approved',
      //   style: { overflowWrap: 'break-word' },
      // },
      // {
      //   header: approversCount,
      //   meta: 'Total Approvers',
      //   description: 'Need a 51% approval',
      //   style: { overflowWrap: 'break-word' },
      // },
      {
        header: web3.utils.fromWei(balance, 'ether'),
        meta: 'Balance for account',
        description: '',
        style: { overflowWrap: 'break-word' },
      },
    ];

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <h3>Show bank accounts</h3>
        {this.renderCards()}
        <Link route={`/campaigns/${this.props.address}/requests`}>
          <a> {/* <Button>View requests</Button> */}</a>
        </Link>
        <ContributeForm address={this.props.address} />
      </Layout>
    );
  }
}

export default CampaignShow;