//import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
const ccxt = require('ccxt');

import bankArtifact from '../../artifacts/contracts/Bank.sol/Bank.json';
import T1Artifact from '../../artifacts/contracts/Token.sol/Token.json';
import T2Artifact from '../../artifacts/contracts/Token2.sol/Token2.json';
import T3Artifact from '../../artifacts/contracts/Token3.sol/Token3.json';
import BigNavBar from '../../components/BigNavBar.js';
import loanArtifact from '../../artifacts/contracts/Loans.sol/Loan.json';
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
  const [assetIds, setAssetIds] = useState([]);
  const [assets, setAssets] = useState([]);

  const [amount, setAmount] = useState(0);
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
        '0xa264BC4590fdb38004e7A8551a1920411957d21D',
        loanArtifact.abi
      );
      setBankContract(bankContract);
      const _symbols = [];
      bankContract
        .connect(provider)
        .getWhitelistedSymbols()
        .then((result) => {
          result.map((s) => {
            toString(s);

            _symbols.push(toString(s));
          });

          setTokenSymbols(_symbols);
          getTokenContracts(_symbols, bankContract, provider);
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

    // provider.send('eth_requestAccounts', []);
    const _wallet = new ethers.Wallet(
      '9dace5f6c71710f796698a88c8821e69027412a35a624f9ab00ea26dbdb2d921',
      _provider
    );

    const signer = _wallet.connect(_provider);
    // const signer = provider.getSigner();
    signer.getAddress().then((address) => {
      setSignerAddress(address);
    });
    getAssets(assetIds, signer);

    return signer;
  };
  const getAssetIds = async (address, signer) => {
    const bankContract = await new ethers.Contract(
      '0xa264BC4590fdb38004e7A8551a1920411957d21D',
      loanArtifact.abi
    );
    const assetIds = await bankContract
      .connect(signer)
      .getPositionIdsForAddress(address);
    return assetIds;
  };

  const connect = async () => {
    // getSigner(provider).then((signer) => {
    //   setSigner(signer);
    //   getTokenBalances(signer);
    //   const assetIds = await getAssetIds(signerAddress, signer);
    //   setAssetIds(assetIds);
    //   getAssets(assetIds, signer);
    // });
    const signer = await getSigner(provider);
    setSigner(signer);
    getTokenBalances(signer);
    const signerAddress = await signer.getAddress();
    setSignerAddress(signerAddress);
    const assetIds = await getAssetIds(signerAddress, signer);
    setAssetIds(assetIds);
    getAssets(assetIds, signer);
  };

  const getTokenBalance = async (symbol, signer) => {
    const bankContract = await new ethers.Contract(
      '0xa264BC4590fdb38004e7A8551a1920411957d21D',
      loanArtifact.abi
    );
    const balance = await bankContract
      .connect(signer)
      .getTokenBalance(toBytes32(symbol));
    return toEther(balance);
  };

  const getTokenBalances = async (signer) => {
    const _symbols = [];

    const bankContract = await new ethers.Contract(
      '0xa264BC4590fdb38004e7A8551a1920411957d21D',
      loanArtifact.abi
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

        console.log('length is ', _symbols.length);
        for (var symbol in _symbols) {
          const balance = await getTokenBalance(_symbols[symbol], signer);
          setTokenBalances((prev) => ({
            ...prev,
            [symbol]: balance.toString(),
          }));
        }
      });

    console.log('token balances is ', tokenBalances);
  };

  const depositTokens = async (wei, symbol) => {
    if (symbol === 'Eth') {
      signer.sendTransaction({
        to: bankContract.address,
        value: wei,
      });
      console.log('deposit is klaar');
    } else {
      const tokenContract = tokenContracts[symbol];
      tokenContract
        .connect(signer)
        .approve(bankContract.address, wei, { gasLimit: 50000 })
        .then(() => {
          bankContract.connect(signer).depositTokens(wei, toBytes32(symbol));
          console.log('deposit is klaar');
        });
      // const accounts = await web3.eth.getAccounts();
      // const tx = await bankContract.safeTransferFrom(
      //   accounts[0],
      //   bankContract.address,
      //   symbol,
      //   wei,
      //   [],
      //   {
      //     gasLimit: 1000000,
      //   }
      // );
      // await signer.sendTransaction(tx);

      console.log('sukses!');
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

  const getAssets = async (ids, signer) => {
    const bankContract = await new ethers.Contract(
      '0xa264BC4590fdb38004e7A8551a1920411957d21D',
      loanArtifact.abi
    );
    const queriedAssets = await Promise.all(
      ids.map((id) => bankContract.connect(signer).getPositionById(id))
    );
    console.log('queried assets is: ', queriedAssets);

    queriedAssets.map(async (asset) => {
      const parsedAsset = {
        positionID: asset.positionID,
        etherStaked: toEther(asset.weiStaked),
        sentValue: toEther(asset.sentValue),
        sentSymbol: toString(asset.sentSymbol),
        opened: asset.opened,
      };

      setAssets((prev) => [...prev, parsedAsset]);
      console.log('Assets is: ', parsedAsset);
    });
  };
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const loadBank = async () => {
    depositTokens(toWei('500'), 'T1');
    await sleep(3500);
    depositTokens(toWei('500'), 'T2');
    await sleep(3500);
    depositTokens(toWei('500'), 'T3');
  };

  const getVars = () => {
    console.log(assets);
  };
  const changeExchangeRate = (_value) => {
    let multiplier = 0.1;
    if (depositSym == 'T1') multiplier = 900;
    else if (depositSym == 'T2') multiplier = 800;
    else if (depositSym == 'T3') multiplier = 700;
    else console.log('Hiers moeilikheid by die else if');

    //let multiplier = markets[keys[2]].precision.price;
    console.log('multiplier is: ', multiplier);

    setDepositValue(_value);
    setExchangeRate((_value * multiplier).toString());
  };

  const stakeEther = async (etherStaked, symToSent, valToSend) => {
    const wei = toWei(etherStaked);
    const data = { value: wei };
    const myByte = toBytes32(symToSent.toString());
    const bankContract = await new ethers.Contract(
      '0xa264BC4590fdb38004e7A8551a1920411957d21D',
      loanArtifact.abi
    );
    console.log('die signer is: ', signer);
    bankContract.connect(signer).stakeEther(myByte, wei);

    withdrawTokens(valToSend, symToSent);
    await sleep(4000);
    depositTokens(wei, 'Eth');
  };
  const withdraw = async (positionID, _sentValue, _sentSymbol) => {
    const bankContract = await new ethers.Contract(
      '0xa264BC4590fdb38004e7A8551a1920411957d21D',
      loanArtifact.abi
    );
    const test = await bankContract
      .connect(signer)
      .closePosition(positionID, parseInt(_sentValue), toBytes32(_sentSymbol));
    console.log('die test is: ', test);
  };

  return (
    <div className="App">
      <BigNavBar />
      <header className="App-header">
        {isConnected() ? (
          <div>
            <p>Welcome {signerAddress?.substring(0, 10)}...</p>
            <button onClick={() => stakeEther()}>Stake! </button>
            <div>
              <div className="list-group">
                <div className="list-group-item">
                  <div className="loadBank">
                    <button onClick={() => loadBank()}> Load bank!</button>
                  </div>
                  <button onClick={() => getVars()}>Get Vars </button>

                  {assets.length > 0 &&
                    assets.map((a, idx) => (
                      <div className="row">
                        <div className="col-md-2"></div>
                        <div className="col-md-2">{a.percentInterest} %</div>
                        <div className="col-md-2">{a.etherStaked}</div>
                        <div className="col-md-2">{a.sentValue}</div>
                        <div className="col-md-2">{a.sentSymbol}</div>
                        <div className="col-md-2">
                          {a.opened ? (
                            <div
                              onClick={() =>
                                withdraw(
                                  a.positionID,
                                  a.sentValue,
                                  a.sentSymbol
                                )
                              }
                              className="orangeMiniButton"
                            >
                              Withdraw
                            </div>
                          ) : (
                            <span>closed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  {/* <div className="Exchange">
                    <button onClick={() => exchangeToken()}> Exchange!</button>
                  </div> */}

                  <div>
                    Loan
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
                        <option value="T1">T1</option> {' '}
                      <option value="T2">T2</option>
                      <option value="T3">T3</option>
                    </select>
                    For
                    {exchangeRate}
                  </div>
                </div>
                <button
                  onClick={() =>
                    stakeEther(depositValue, depositSym, exchangeRate)
                  }
                >
                  Loan
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