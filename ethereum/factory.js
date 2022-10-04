import web3 from './web3';
import CampaignFactory from './build/campaignFactory.json';
const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0x2db51565B784301c872547dc13b6295527045615'
);

export default instance;
