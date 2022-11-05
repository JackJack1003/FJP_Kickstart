import { Router } from 'next/router';
import React, { Component } from 'react';
import { Form, Input, Message, Button } from 'semantic-ui-react';
import Campaign from '../ethereum/campaign';
import web3 from '../ethereum/web3';
import { client } from '../lib/sanityClient';

class ContributeForm extends Component {
  state = {
    value: '',
    loading: false,
  };
  saveTransaction = async () => {
    console.log('save het begin');
    const accounts = await web3.eth.getAccounts();
    const txDoc = {
      _type: 'transactions',
      fromAccount: accounts[0],
      toAccount: this.props.address,
      amount: this.state.value,
      timeStamp: new Date(Date.now()).toISOString(),
    };
    await client.create(txDoc);
    console.log('klaar ge create');
  };
  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    const campaign = Campaign(this.props.address);
    console.log('net voor try');
    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, 'ether'),
      });
      console.log('net na try');
      console.log('save het begin');
      //const accounts = await web3.eth.getAccounts();
      const txDoc = {
        _type: 'transactions',
        fromAddress: window.localStorage.getItem('address'),
        toAddress: this.props.address,
        amount: parseFloat(this.state.value),
        timeStamp: new Date(Date.now()).toISOString(),
      };
      await client.create(txDoc);
      console.log('klaar ge create');
      this.setState({ loading: false });
      Router.replaceRoute(`/campaigns/${this.props.address}`);
    } catch (err) {}
  };
  render() {
    let loading = this.state.loading;
    return (
      <div>
        {loading ? (
          <div>
            <h1> Loading</h1>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <Form onSubmit={this.onSubmit}>
            <Form.Field>
              <label>Amount to pay</label>
              <Input
                value={this.state.value}
                onChange={(event) => {
                  this.setState({ value: event.target.value });
                }}
              ></Input>
            </Form.Field>
            <Button primary>Pay!</Button>
          </Form>
        )}
      </div>
    );
  }
}

export default ContributeForm;
