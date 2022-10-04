import React, { Component } from 'react';
import { useEffect, useState } from 'react';
import { client } from '../../lib/sanityClient';
import web3 from '../../ethereum/web3';
import { render } from 'react-dom';

class history extends Component {
  state = {
    clientInfo: [{}],
  };

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    const query = `
        *[_type=="transactions" && fromAddress == "${accounts[0]}"] { toAddress, 
            amount, timeStamp
        }
      `;
    const clientRes = await client.fetch(query);
    console.log('client res is: ', clientRes);
    this.setState({ clientInfo: clientRes });
    console.log('client info state is: ', this.state.clientInfo);
  }
  showClient() {
    const rendered = [];
    for (let id of Object.keys(this.state.clientInfo)) {
      rendered.push(<h3>{this.state.clientInfo[id].toAddress}</h3>);
      rendered.push(<h3>{this.state.clientInfo[id].amount}</h3>);
      rendered.push(<h3>{this.state.clientInfo[id].timeStamp}</h3>);
    }
    return <div>{rendered}</div>;
  }
  render() {
    return (
      <div>
        <h1> history</h1>

        {this.showClient()}
      </div>
    );
  }
}

export default history;
