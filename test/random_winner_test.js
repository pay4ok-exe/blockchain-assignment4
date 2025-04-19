const RandomWinner = artifacts.require("RandomWinner");

contract("RandomWinner", function(accounts) {
  const owner = accounts[0];
  const player = accounts[1];
  
  let randomWinnerInstance;

  beforeEach(async function() {
    // Create a new instance with just the owner parameter as per your constructor
    randomWinnerInstance = await RandomWinner.new(owner, { from: owner });
    
    // Add funds after creation
    await randomWinnerInstance.addFunds({ 
      from: owner, 
      value: web3.utils.toWei("0.2", "ether") 
    });
  });

  it("should initialize with correct values", async function() {
    const totalAmount = await randomWinnerInstance.getTotalAmount();
    assert.equal(totalAmount.toString(), web3.utils.toWei("0.2", "ether"), "Initial total amount is incorrect");
  });

  it("should calculate win amount correctly", async function() {
    const betAmount = web3.utils.toWei("0.05", "ether");
    const winAmount = await randomWinnerInstance.getWinAmount(betAmount);
    
    // Expected win amount is min(2 * betAmount, totalAmount + betAmount - minAmount)
    const expectedWinAmount = web3.utils.toBN(betAmount).mul(web3.utils.toBN(2)).toString();
    
    assert.equal(winAmount.toString(), expectedWinAmount, "Win amount calculation is incorrect");
  });

  it("should allow owner to configure parameters", async function() {
    const newMinAmount = web3.utils.toWei("0.2", "ether");
    const newDividend = 2;
    const newDivisor = 5;
    
    // Note the function name is 'configure' not 'conifgure'
    await randomWinnerInstance.configure(newMinAmount, newDividend, newDivisor, { from: owner });
    
    // We can't directly check the private variables, but we can verify that the configuration 
    // changed by checking the win amount calculation which depends on minAmount
    const betAmount = web3.utils.toWei("0.05", "ether");
    const winAmount = await randomWinnerInstance.getWinAmount(betAmount);
    
    // After changing minAmount, the win amount calculation should change
    const totalAmount = await randomWinnerInstance.getTotalAmount();
    const expectedWinAmount = web3.utils.toBN(totalAmount).add(web3.utils.toBN(betAmount)).sub(web3.utils.toBN(newMinAmount)).toString();
    
    assert.equal(winAmount.toString(), expectedWinAmount, "Configuration did not change the win amount calculation");
  });

  it("should allow a player to make an attempt", async function() {
    const betAmount = web3.utils.toWei("0.05", "ether");
    
    const initialPlayerBalance = await web3.eth.getBalance(player);
    const initialContractBalance = await web3.eth.getBalance(randomWinnerInstance.address);
    
    // Make an attempt
    const result = await randomWinnerInstance.attempt(player, { 
      from: player,
      value: betAmount
    });
    
    // Get final balances
    const finalPlayerBalance = await web3.eth.getBalance(player);
    const finalContractBalance = await web3.eth.getBalance(randomWinnerInstance.address);
    
    // Verify balances changed 
    // Note: exact amounts can't be determined precisely because of gas costs and 
    // the randomness of winning/losing, but we can verify that balances changed
    assert.notEqual(initialPlayerBalance, finalPlayerBalance, "Player balance should change");
    assert.notEqual(initialContractBalance, finalContractBalance, "Contract balance should change");
  });
});