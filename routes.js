const routes = require('next-routes')();

routes
  .add('/exchange', '/exchange/index')
  .add('/campaigns/new', '/campaigns/new')
  .add('/campaigns/:address', '/campaigns/show')
  .add('/campaigns/:address/requests', '/campaigns/requests/index');
module.exports = routes;
