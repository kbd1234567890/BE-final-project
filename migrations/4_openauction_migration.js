const OpenAuction = artifacts.require("OpenAuction");

module.exports = function (deployer) {
  deployer.deploy(OpenAuction);
};
