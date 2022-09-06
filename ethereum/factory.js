import web3 from './web3';
import CampaignFactory from './build/campaignFactory.json';
const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0x793A62428562B35D636359E548Ad77E912a11400'
);

export default instance;
