import { Router } from 'next/router';
import React, { Component } from 'react';
import { Form, Input, Message, Button } from 'semantic-ui-react';
import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';

class ContributeForm extends Component {
  state = {
    value: '',
  };
  onSubmit = async (event) => {
    event.preventDefault();
    const campaign = Campaign(this.props.address);
    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, 'ether'),
      });
      Router.replaceRoute(`/campaigns/${this.props.address}`);
    } catch (err) {}
  };
  render() {
    return (
      <Form onSubmit={this.onSubmit}>
        <Form.Field>
          <label>Amount to pay</label>
          <Input
            value={this.state.value}
            onChange={(event) => {
              this.setState({ value: event.target.value });
            }}
            label="ether"
            labelPosition="right"
          ></Input>
        </Form.Field>
        <Button primary>Pay!</Button>
      </Form>
    );
  }
}

export default ContributeForm;
