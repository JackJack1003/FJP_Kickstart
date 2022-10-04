//import './App.css';
import react, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import artifact from '../../artifacts/contracts/Staking.sol/Staking.json';

import NavBar from './components/NavBar';
import StakeModal from './components/StakeModal';
import { Bank, PiggyBank, Coin } from 'react-bootstrap-icons';
import BigNavBar from '../../components/BigNavBar';

const CONTRACT_ADDRESS = '0x41f7206e131c4Ac076D94cB5ea0302cB2D3CACee';

function App() {
  // general
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);

  // assets
  const [assetIds, setAssetIds] = useState([]);
  const [assets, setAssets] = useState([]);

  // staking
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [stakingLength, setStakingLength] = useState(undefined);
  const [stakingPercent, setStakingPercent] = useState(undefined);
  const [amount, setAmount] = useState(0);
  const [wallet, setWallet] = useState(undefined);

  // helpers
  const toWei = (ether) => ethers.utils.parseEther(ether);
  const toEther = (wei) => ethers.utils.formatEther(wei);

  useEffect(() => {
    const onLoad = async () => {
      // const provider = await new ethers.providers.Web3Provider(window.ethereum);
      // setProvider(provider);

      const provider = await new ethers.providers.InfuraProvider(
        'goerli',
        'cf39d39ac33347f7959e2575d8e5b5c9'
      );
      setProvider(provider);

      console.log('provider is nie probleem nie');
      const wallet = await new ethers.Wallet(
        '9dace5f6c71710f796698a88c8821e69027412a35a624f9ab00ea26dbdb2d921',
        provider
      );
      console.log('wallet is: ', wallet);
      setWallet(wallet);
      console.log('wallet is nie probleem nie');
      const contract = await new ethers.Contract(
        CONTRACT_ADDRESS,
        artifact.abi
      );
      setContract(contract);
      console.log('contract is nie probleem nie');
    };

    onLoad();
  }, []);

  const isConnected = () => signer !== undefined;

  const getSigner = async () => {
    //provider.send('eth_requestAccounts', []);
    const signer = wallet.connect(provider);
    setSigner(signer);
    getAssets(assetIds, signer);
    return signer;
  };

  const getAssetIds = async (address, signer) => {
    const assetIds = await contract
      .connect(signer)
      .getPositionIdsForAddress(address);
    return assetIds;
  };

  const calcDaysRemaining = (unlockDate) => {
    const timeNow = Date.now() / 1000;
    const secondsRemaining = unlockDate - timeNow;
    return Math.max((secondsRemaining / 60 / 60 / 24).toFixed(0), 0);
  };

  const getAssets = async (ids, signer) => {
    const queriedAssets = await Promise.all(
      ids.map((id) => contract.connect(signer).getPositionById(id))
    );

    queriedAssets.map(async (asset) => {
      const parsedAsset = {
        positionID: asset.positionID,
        percentInterest: Number(asset.percentInterest) / 100,
        daysRemaining: calcDaysRemaining(Number(asset.unlockedDate)),
        etherInterest: toEther(asset.weiInterest),
        etherStaked: toEther(asset.weiStaked),
        opened: asset.opened,
      };

      setAssets((prev) => [...prev, parsedAsset]);
      console.log('Assets is: ', parsedAsset);
    });
  };

  const connectAndLoad = async () => {
    console.log('hy connect en load');
    const signer = await getSigner(provider);
    setSigner(signer);

    const signerAddress = await signer.getAddress();
    setSignerAddress(signerAddress);

    const assetIds = await getAssetIds(signerAddress, signer);
    setAssetIds(assetIds);

    getAssets(assetIds, signer);
  };

  const openStakingModal = (stakingLength, stakingPercent) => {
    setShowStakeModal(true);
    setStakingLength(stakingLength);
    setStakingPercent(stakingPercent);
  };

  const stakeEther = () => {
    const wei = toWei(amount);
    const data = { value: wei };
    connectAndLoad();
    console.log('contract is: ', contract);
    console.log('signer is: ', signer);
    contract.connect(signer).stakeEther(stakingLength, data);
  };

  const withdraw = (positionID) => {
    console.log('positionID is ');
    console.log(positionID);
    contract.connect(signer).closePosition(positionID);
  };

  return (
    <div className="App">
      <BigNavBar />
      <div>
        <NavBar isConnected={isConnected} connect={connectAndLoad} />
      </div>

      <div className="appBody">
        <div className="marketContainer">
          <div className="subContainer">
            <span className="marketHeader">Ethereum Market</span>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div
                onClick={() => openStakingModal(30, '7%')}
                className="marketOption"
              >
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>1 Month</span>
                  <span className="optionPercent">7%</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                onClick={() => openStakingModal(90, '10%')}
                className="marketOption"
              >
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>3 Months</span>
                  <span className="optionPercent">10%</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                onClick={() => openStakingModal(180, '12%')}
                className="marketOption"
              >
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>6 Months</span>
                  <span className="optionPercent">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="assetContainer">
          <div className="subContainer">
            <span className="marketHeader">Staked Assets</span>
          </div>
          <div>
            <div className="row columnHeaders">
              <div className="col-md-2">Assets</div>
              <div className="col-md-2">Percent Interest</div>
              <div className="col-md-2">Staked</div>
              <div className="col-md-2">Interest</div>
              <div className="col-md-2">Days Remaining</div>
              <div className="col-md-2"></div>
            </div>
          </div>
          <br />
          {assets.length > 0 &&
            assets.map((a, idx) => (
              <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-2">{a.percentInterest} %</div>
                <div className="col-md-2">{a.etherStaked}</div>
                <div className="col-md-2">{a.etherInterest}</div>
                <div className="col-md-2">{a.daysRemaining}</div>
                <div className="col-md-2">
                  {a.opened ? (
                    <div
                      onClick={() => withdraw(a.positionID)}
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
        </div>
      </div>
      {showStakeModal && (
        <StakeModal
          onClose={() => setShowStakeModal(false)}
          stakingLength={stakingLength}
          stakingPercent={stakingPercent}
          amount={amount}
          setAmount={setAmount}
          stakeEther={stakeEther}
        />
      )}
    </div>
  );
}

export default App;
