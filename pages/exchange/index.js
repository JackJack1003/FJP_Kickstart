//import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Modal from './Modal.js';

import bankArtifact from '../../artifacts/contracts/Bank.sol/Bank.json';
import maticArtifact from '../../artifacts/contracts/Matic.sol/Matic.json';
import shibArtifact from '../../artifacts/contracts/Shib.sol/Shib.json';
import usdtArtifact from '../../artifacts/contracts/Usdt.sol/Usdt.json';
//import { Button } from 'bootstrap';

export default function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [bankContract, setBankContract] = useState(undefined);
  const [tokenContracts, setTokenContracts] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});
  const [tokenSymbols, setTokenSymbols] = useState([]);

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
        '0xE350868425Ff67e1c5D0D0b6AF483FC4a093fE32',
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

  const depositTokens = (wei, symbol) => {
    if (symbol === 'Eth') {
      signer.sendTransaction({
        to: bankContract.address,
        value: wei,
      });
    } else {
      const tokenContract = tokenContracts[symbol];
      console.log('hier2');
      tokenContract
        .connect(signer)
        .approve(bankContract.address, wei)
        .then(() => {
          console.log('hier3');
          bankContract.connect(signer).depositTokens(wei, toBytes32(symbol));
        });
    }
  };

  const withdrawTokens = (wei, symbol) => {
    if (symbol === 'Eth') {
      bankContract.connect(signer).withdrawEther(wei);
    } else {
      bankContract.connect(signer).withdrawTokens(wei, toBytes32(symbol));
    }
  };

  const exchangeToken = () => {
    const wei = toWei('100');
    depositTokens(wei, 'Usdt');
    withdrawTokens(wei, 'Shib');
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

  return (
    <div className="App">
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

                      <div className="d-flex gap-4 col-md-6">
                        <button
                          onClick={() => displayModal(symbol)}
                          className="btn btn-primary"
                        >
                          Deposit/Withdraw
                        </button>
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
                    </div>
                  ))}
                  <div className="loadBank">
                    <button onClick={() => loadBank()}> Load bank!</button>
                  </div>
                  <div className="Exchange">
                    <button onClick={() => exchangeToken()}> Exchange!</button>
                  </div>
                </div>
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
