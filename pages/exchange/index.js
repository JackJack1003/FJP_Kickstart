//import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Modal from './Modal.js';
const ccxt = require('ccxt');

import bankArtifact from '../../artifacts/contracts/Bank.sol/Bank.json';
import T1Artifact from '../../artifacts/contracts/Token.sol/Token.json';
import T2Artifact from '../../artifacts/contracts/Token2.sol/Token2.json';
import T3Artifact from '../../artifacts/contracts/Token3.sol/Token3.json';
import BigNavBar from '../../components/BigNavBar.js';
import web3 from '../../ethereum/web3';
//import { Button } from 'bootstrap';
// import { View, Text } from 'react-native';

export default function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [bankContract, setBankContract] = useState(undefined);
  const [tokenContracts, setTokenContracts] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});
  const [tokenSymbols, setTokenSymbols] = useState([]);
  const [exchangeRate, setExchangeRate] = useState('0');
  const [depositValue, setDepositValue] = useState('0');
  const [withdrawValue, setWithdrawValue] = useState('0');
  const [depositSym, setDepositSym] = useState('');
  const [withdrawSym, setWithdrawSym] = useState('');
  const [markets, setMarkets] = useState([]);
  const [keys, setKeys] = useState([]);

  const [amount, setAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(undefined);
  const [isDeposit, setIsDeposit] = useState(true);

  const toBytes32 = (text) => ethers.utils.formatBytes32String(text);
  const toString = (bytes32) => ethers.utils.parseBytes32String(bytes32);
  const toWei = (ether) => ethers.utils.parseEther(ether);
  const toEther = (wei) => ethers.utils.formatEther(wei).toString();
  const toRound = (num) => Number(num).toFixed(2);

  useEffect(() => {
    const init = async () => {
      let bybit_futures = new ccxt.bybit({});
      let dummyMarkets = await bybit_futures.loadMarkets();
      setMarkets(dummyMarkets);
      var dummyKeys = Object.keys(dummyMarkets);
      setKeys(dummyKeys);

      //console.log('Price is: ', dummyMarkets[dummyKeys[2]].precision.price);
      // const provider = await new ethers.providers.Web3Provider(window.ethereum);
      // setProvider(provider);
      const provider = await new ethers.providers.InfuraProvider(
        'goerli',
        'cf39d39ac33347f7959e2575d8e5b5c9'
      );
      setProvider(provider);
      const wallet = new ethers.Wallet(
        '9dace5f6c71710f796698a88c8821e69027412a35a624f9ab00ea26dbdb2d921',
        provider
      );
      setWallet(wallet);

      const bankContract = await new ethers.Contract(
        '0xF09293966F92F25757BA2CE502036C7D2032911D',
        bankArtifact.abi
      );
      setBankContract(bankContract);
      const _symbols = [];
      bankContract
        .connect(provider)
        .getWhitelistedSymbols()
        .then((result) => {
          result.map((s) => {
            toString(s);
            //console.log('s is ', toString(s));
            _symbols.push(toString(s));
          });
          //console.log('die _symbols is', _symbols);
          setTokenSymbols(_symbols);
          getTokenContracts(_symbols, bankContract, provider);
        });
      console.log('use Effect is wiele');

      //initial transfer
      //depositTokens(toWei('500'), 'Eth');
    };
    init();
  }, []);

  const getTokenContract = async (symbol, bankContract, provider) => {
    //setMarkets();

    const address = await bankContract
      .connect(provider)
      .getWhitelistedTokenAddress(toBytes32(symbol));
    const abi =
      symbol === 'T1'
        ? T1Artifact.abi
        : symbol === 'T2'
        ? T2Artifact.abi
        : T3Artifact.abi;
    //console.log(abi);
    const tokenContract = new ethers.Contract(address, abi);
    return tokenContract;
  };

  const getTokenContracts = async (symbols, bankContract, provider) => {
    symbols.map(async (symbol) => {
      const contract = await getTokenContract(symbol, bankContract, provider);
      setTokenContracts((prev) => ({ ...prev, [symbol]: contract }));
    });
  };

  const isConnected = () => signer !== undefined;

  const getSigner = async (provider) => {
    const _provider = await new ethers.providers.InfuraProvider(
      'goerli',
      'cf39d39ac33347f7959e2575d8e5b5c9'
    );
    console.log('provider is', _provider);
    // provider.send('eth_requestAccounts', []);
    const _wallet = new ethers.Wallet(
      '9dace5f6c71710f796698a88c8821e69027412a35a624f9ab00ea26dbdb2d921',
      _provider
    );
    console.log('wallet is', _wallet);
    const signer = _wallet.connect(_provider);
    // const signer = provider.getSigner();
    signer.getAddress().then((address) => {
      setSignerAddress(address);
    });

    return signer;
  };

  const connect = () => {
    getSigner(provider).then((signer) => {
      setSigner(signer);
      getTokenBalances(signer);
    });
  };

  const getTokenBalance = async (symbol, signer) => {
    const bankContract = await new ethers.Contract(
      '0xF09293966F92F25757BA2CE502036C7D2032911D',
      bankArtifact.abi
    );
    const balance = await bankContract
      .connect(signer)
      .getTokenBalance(toBytes32(symbol));
    return toEther(balance);
  };

  const getTokenBalances = async (signer) => {
    const _symbols = [];
    console.log('token balances word geroep');
    const bankContract = await new ethers.Contract(
      '0xF09293966F92F25757BA2CE502036C7D2032911D',
      bankArtifact.abi
    );
    const _provider = await new ethers.providers.InfuraProvider(
      'goerli',
      'cf39d39ac33347f7959e2575d8e5b5c9'
    );
    bankContract
      .connect(_provider)
      .getWhitelistedSymbols()
      .then(async (result) => {
        result.map((s) => {
          toString(s);
          _symbols.push(toString(s));
        });

        console.log(_symbols);
        console.log('length is ', _symbols.length);
        for (var symbol in _symbols) {
          const balance = await getTokenBalance(_symbols[symbol], signer);
          setTokenBalances((prev) => ({
            ...prev,
            [symbol]: balance.toString(),
          }));
          console.log(_symbols[symbol]);
        }
      });

    console.log('token balances is ', tokenBalances);
  };

  const displayModal = (symbol) => {
    setSelectedSymbol(symbol);
    setShowModal(true);
  };

  const depositTokens = async (wei, symbol) => {
    await sleep(2000);
    if (symbol === 'Eth') {
      signer.sendTransaction({
        to: bankContract.address,
        value: wei,
      });
    } else {
      const tokenContract = tokenContracts[symbol];
      tokenContract
        .connect(signer)
        .approve(bankContract.address, wei, { gasLimit: 50000 })
        .then(() => {
          bankContract.connect(signer).depositTokens(wei, toBytes32(symbol));
          console.log('deposit is klaar');
        });
      await sleep(5000);
      console.log('sukses!');
    }
  };

  const withdrawTokens = async (wei, symbol) => {
    if (symbol === 'Eth') {
      bankContract.connect(signer).withdrawEther(wei);
    } else {
      bankContract.connect(signer).withdrawTokens(wei, toBytes32(symbol));
      await sleep(5000);
      console.log('withdraw is klaar');
    }
  };

  const exchange = async (_depSym, _withSym, _depValue, _withValue) => {
    console.log('exchange word gecall');
    console.log(_depSym, _depValue, _withSym, _withValue);
    const withWei = toWei(_withValue);
    const depWei = toWei(_depValue);
    // await getTokenContract();
    depositTokens(depWei, _depSym);
    await sleep(5000);
    withdrawTokens(withWei, _withSym);
    await sleep(5000);
    withdrawTokens(withWei, _withSym);
    await sleep(5000);
  };

  const depositOrWithdraw = (e, symbol) => {
    e.preventDefault();
    const wei = toWei(amount);

    if (isDeposit) {
      depositTokens(wei, symbol);
    } else {
      withdrawTokens(wei, symbol);
    }
  };
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const loadBank = async () => {
    console.log('token balances is by load: ', tokenBalances);
    depositTokens(toWei('500'), 'T1');
    await sleep(3500);
    depositTokens(toWei('500'), 'T2');
    await sleep(3500);
    depositTokens(toWei('500'), 'T3');
  };
  const changeExchangeRate = (_value) => {
    let multiplier = 0.1;
    if (depositSym == withdrawSym) multiplier = 1;
    else if (depositSym == 'T1' && withdrawSym == 'T2')
      multiplier = markets[keys[0]].precision.price;
    else if (depositSym == 'T2' && withdrawSym == 'T3')
      multiplier = markets[keys[1]].precision.price;
    else if (depositSym == 'T3' && withdrawSym == 'T1')
      multiplier = markets[keys[2]].precision.price;
    else if (depositSym == 'T1' && withdrawSym == 'T3')
      multiplier = 1 / markets[keys[2]].precision.price;
    else if (depositSym == 'T2' && withdrawSym == 'T1')
      multiplier = 1 / markets[keys[0]].precision.price;
    else if (depositSym == 'T3' && withdrawSym == 'T2')
      multiplier = 1 / markets[keys[1]].precision.price;
    else console.log('Hiers moeilikheid by die else if');

    //let multiplier = markets[keys[2]].precision.price;
    console.log('multiplier is: ', multiplier);
    console.log(depositSym, withdrawSym);

    setDepositValue(_value);
    setExchangeRate((_value * multiplier).toString());
    console.log(exchangeRate);
  };

  return (
    <div className="App">
      <BigNavBar />
      <header className="exchange_App_Header">
        {isConnected() ? (
          <div>
            <p>Welcome {signerAddress?.substring(0, 10)}...</p>
            <div>
              <div>
                <div>
                  {Object.keys(tokenBalances).map((symbol, idx) => (
                    <div key={idx}>
                      <div>
                        <div>{symbol.toUpperCase()}</div>
                      </div>

                      <div>
                        <small>{toRound(tokenBalances[symbol])}</small>
                      </div>

                      <Modal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        symbol={selectedSymbol}
                        depositOrWithdraw={depositOrWithdraw}
                        isDeposit={isDeposit}
                        setIsDeposit={setIsDeposit}
                        setAmount={setAmount}
                      />
                    </div>
                    // </div>
                  ))}
                  <div>
                    <button onClick={() => loadBank()}> Load bank!</button>
                  </div>
                  {/* <div className="Exchange">
                    <button onClick={() => exchangeToken()}> Exchange!</button>
                  </div> */}

                  <div>
                    {/* <input
                      onChange={(e) => {
                        setExchangeRate(e.target.value);
                      }}
                    /> */}
                    <div className="exchange_Deposit">
                      Deposit
                      <div className="exchange_Deposit_Input">
                        <input
                          onChange={(e) => changeExchangeRate(e.target.value)}
                        />
                        <div className="exchange_Deposit_Select">
                          <select
                            id="selectList"
                            onChange={(e) => setDepositSym(e.target.value)}
                          >
                              <option value="T1">T1</option> {' '}
                            <option value="T2">T2</option>
                            <option value="T3">T3</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="exchange_Withdraw">
                      <div className="exchange_Withdraw_For">For</div>

                      {exchangeRate}
                      <div className="exchange_Withdraw_Select">
                        <select
                          id="selectList"
                          onChange={(e) => setWithdrawSym(e.target.value)}
                        >
                            <option value="T1">T1</option> {' '}
                          <option value="T2">T2</option>
                          <option value="T3">T3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    exchange(
                      depositSym,
                      withdrawSym,
                      depositValue,
                      exchangeRate
                    )
                  }
                >
                  Exchange!
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p>You are not connected</p>
            <button onClick={connect}>Connect Metamask</button>
          </div>
        )}
      </header>
    </div>
  );
}

//export default App;
