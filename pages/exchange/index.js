//import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Modal from './Modal.js';
const ccxt = require('ccxt');

import bankArtifact from '../../artifacts/contracts/Bank.sol/Bank.json';
import maticArtifact from '../../artifacts/contracts/Matic.sol/Matic.json';
import shibArtifact from '../../artifacts/contracts/Shib.sol/Shib.json';
import usdtArtifact from '../../artifacts/contracts/Usdt.sol/Usdt.json';
import BigNavBar from '../../components/BigNavBar.js';
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
        'rinkeby',
        '7a262829a92541f1b6fab55960a806cd'
      );
      setProvider(provider);
      const wallet = new ethers.Wallet(
        '9dace5f6c71710f796698a88c8821e69027412a35a624f9ab00ea26dbdb2d921',
        provider
      );
      setWallet(wallet);

      const bankContract = await new ethers.Contract(
        '0xaC5F6e0c450B1B22beaC121B7978e23E8a45DFAf',
        bankArtifact.abi
      );
      setBankContract(bankContract);

      bankContract
        .connect(provider)
        .getWhitelistedSymbols()
        .then((result) => {
          const symbols = result.map((s) => toString(s));
          setTokenSymbols(symbols);
          getTokenContracts(symbols, bankContract, provider);
        });

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
      symbol === 'Matic'
        ? maticArtifact.abi
        : symbol === 'Shib'
        ? shibArtifact.abi
        : usdtArtifact.abi;
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
    //provider.send('eth_requestAccounts', []);
    //const signer = provider.getSigner();
    const signer = wallet.connect(provider);
    setSigner(signer);
    console.log('Signer is: ', signer);

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
    const balance = await bankContract
      .connect(signer)
      .getTokenBalance(toBytes32(symbol));
    return toEther(balance);
  };

  const getTokenBalances = (signer) => {
    tokenSymbols.map(async (symbol) => {
      const balance = await getTokenBalance(symbol, signer);
      setTokenBalances((prev) => ({ ...prev, [symbol]: balance.toString() }));
    });
  };

  const displayModal = (symbol) => {
    setSelectedSymbol(symbol);
    setShowModal(true);
  };

  const depositTokens = async (wei, symbol) => {
    if (symbol === 'Eth') {
      signer.sendTransaction({
        to: bankContract.address,
        value: wei,
      });
    } else {
      const tokenContract = tokenContracts[symbol];
      tokenContract
        .connect(signer)
        .approve(bankContract.address, wei)
        .then(() => {
          bankContract.connect(signer).depositTokens(wei, toBytes32(symbol));
          console.log('deposit is klaar');
        });
    }
  };

  const withdrawTokens = async (wei, symbol) => {
    if (symbol === 'Eth') {
      bankContract.connect(signer).withdrawEther(wei);
    } else {
      bankContract.connect(signer).withdrawTokens(wei, toBytes32(symbol));
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
    depositTokens(toWei('500'), 'Matic');
    await sleep(3500);
    depositTokens(toWei('500'), 'Shib');
    await sleep(3500);
    depositTokens(toWei('500'), 'Usdt');
  };
  const changeExchangeRate = (_value) => {
    let multiplier = 0.1;
    if (depositSym == withdrawSym) multiplier = 1;
    else if (depositSym == 'Matic' && withdrawSym == 'Shib')
      multiplier = markets[keys[0]].precision.price;
    else if (depositSym == 'Shib' && withdrawSym == 'Usdt')
      multiplier = markets[keys[1]].precision.price;
    else if (depositSym == 'Usdt' && withdrawSym == 'Matic')
      multiplier = markets[keys[2]].precision.price;
    else if (depositSym == 'Matic' && withdrawSym == 'Usdt')
      multiplier = 1 / markets[keys[2]].precision.price;
    else if (depositSym == 'Shib' && withdrawSym == 'Matic')
      multiplier = 1 / markets[keys[0]].precision.price;
    else if (depositSym == 'Usdt' && withdrawSym == 'Shib')
      multiplier = 1 / markets[keys[1]].precision.price;
    else console.log('Hiers moeilikheid by die else if');

    //let multiplier = markets[keys[2]].precision.price;
    console.log('multiplier is: ', multiplier);

    setDepositValue(_value);
    setExchangeRate((_value * multiplier).toString());
    console.log(exchangeRate);
  };

  return (
    <div className="App">
      <BigNavBar />
      <header className="App-header">
        {isConnected() ? (
          <div>
            <p>Welcome {signerAddress?.substring(0, 10)}...</p>
            <div>
              <div className="list-group">
                <div className="list-group-item">
                  {Object.keys(tokenBalances).map((symbol, idx) => (
                    <div className=" row d-flex py-3" key={idx}>
                      <div className="col-md-3">
                        <div>{symbol.toUpperCase()}</div>
                      </div>

                      <div className="d-flex gap-4 col-md-3">
                        <small className="opacity-50 text-nowrap">
                          {toRound(tokenBalances[symbol])}
                        </small>
                      </div>

                      {/* <div className="d-flex gap-4 col-md-6">
                        <button
                          onClick={() => displayModal(symbol)}
                          className="btn btn-primary"
                        >
                          Deposit/Withdraw
                        </button> */}
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
                  <div className="loadBank">
                    <button onClick={() => loadBank()}> Load bank!</button>
                  </div>
                  {/* <div className="Exchange">
                    <button onClick={() => exchangeToken()}> Exchange!</button>
                  </div> */}

                  <div>
                    Deposit
                    {/* <input
                      onChange={(e) => {
                        setExchangeRate(e.target.value);
                      }}
                    /> */}
                    <input
                      onChange={(e) => changeExchangeRate(e.target.value)}
                    />
                    <select
                      name="selectList"
                      id="selectList"
                      onChange={(e) => setDepositSym(e.target.value)}
                    >
                        <option value="Matic">Matic</option> {' '}
                      <option value="Shib">Shib</option>
                      <option value="Usdt">Tether</option>
                    </select>
                    For
                    {exchangeRate}
                    <select
                      name="selectList"
                      id="selectList"
                      onChange={(e) => setWithdrawSym(e.target.value)}
                    >
                        <option value="Matic">Matic</option> {' '}
                      <option value="Shib">Shib</option>
                      <option value="Usdt">Tether</option>
                    </select>
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
            <button onClick={connect} className="btn btn-primary">
              Connect Metamask
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

//export default App;
