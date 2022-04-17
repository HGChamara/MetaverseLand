const Land = artifacts.require("Land");

module.exports = async function(deployer) {
    const NAME = "Ceylon Metaverse City";
    const SYMBOL = "CMC";
    const COST = Web3.utils.toWei('1', 'ether');
  await deployer.deploy(Land, NAME, SYMBOL, COST);
};
