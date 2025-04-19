const RandomWinner = artifacts.require("RandomWinner");
const TicketService = artifacts.require("TicketService");

module.exports = function(deployer, network, accounts) {
  const owner = accounts[0];
  
  // Deploy RandomWinner with minimal parameters
  deployer.deploy(RandomWinner, owner);
  
  // Deploy TicketService
  deployer.deploy(TicketService, owner);
};