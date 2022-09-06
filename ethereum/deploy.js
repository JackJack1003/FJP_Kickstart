const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/campaignFactory.json');

const provider = new HDWalletProvider(
  'regular people come region lock tape inject reunion gun pill display file',
  // remember to change this to your own phrase!
  'https://rinkeby.infura.io/v3/7a262829a92541f1b6fab55960a806cd'
  // remember to change this to your own endpoint!
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);
  let result;
  try {
    result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
      .deploy({ data: compiledFactory.bytecode, arguments: ['Hi there!'] })
      .send({ gas: '1000000', from: accounts[0] });
  } catch (err) {
    console.log(err);
  }

  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();
