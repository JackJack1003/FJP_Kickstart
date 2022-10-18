import React, { Component } from 'react';
import { useEffect, useState } from 'react';
import { client } from '../../lib/sanityClient';
import web3 from '../../ethereum/web3';
import { render } from 'react-dom';
import BigNavBar from '../../components/BigNavBar';

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
      rendered.push(
        <div className="history_Info">
          To:
          <h4>{this.state.clientInfo[id].toAddress}</h4> For an amount of:
          <h4>{this.state.clientInfo[id].amount}</h4>
          On:
          <h4>{this.state.clientInfo[id].timeStamp}</h4>
        </div>
      );
    }
    return <div>{rendered}</div>;
  }
  render() {
    return (
      <div>
        <BigNavBar />
        <div className="history_title">
          <h2> History</h2>
        </div>

        <div className="history_content">{this.showClient()}</div>
      </div>
    );
  }
}

export default history;
