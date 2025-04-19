const TicketService = artifacts.require("TicketService");

contract("TicketService", function(accounts) {
  const owner = accounts[0];
  const buyer1 = accounts[1];
  const buyer2 = accounts[2];
  
  let ticketServiceInstance;

  beforeEach(async function() {
    ticketServiceInstance = await TicketService.new(owner, { from: owner });
  });

  it("should initialize with 12 available tickets", async function() {
    const availableTickets = await ticketServiceInstance.getAvailableTickets();
    assert.equal(availableTickets.length, 12, "Should have 12 available tickets initially");
  });

  it("should allow owner to add a new ticket", async function() {
    await ticketServiceInstance.addTicket({
      ticketId: "d1",
      cost: 400000,
      owner: "0x0000000000000000000000000000000000000000"
    }, { from: owner });
    
    const availableTickets = await ticketServiceInstance.getAvailableTickets();
    assert.equal(availableTickets.length, 13, "Should have 13 available tickets after adding one");
    
    // Find the new ticket in the available tickets
    const newTicket = availableTickets.find(ticket => ticket.ticketId === "d1");
    assert.notEqual(newTicket, undefined, "New ticket should be in the available tickets");
    assert.equal(newTicket.cost.toString(), "400000", "New ticket should have the correct cost");
  });

  it("should check if a ticket is available", async function() {
    const isAvailable = await ticketServiceInstance.checkIfAvailable("a1");
    assert.equal(isAvailable, true, "Ticket a1 should be available initially");
  });

  it("should allow buying a ticket", async function() {
    // Buy ticket a1 with cost 100000
    await ticketServiceInstance.buyTicket(buyer1, "a1", { 
      from: buyer1,
      value: 100000
    });
    
    // Check if ticket is no longer available
    const isAvailable = await ticketServiceInstance.checkIfAvailable("a1");
    assert.equal(isAvailable, false, "Ticket a1 should not be available after buying");
    
    // Check if buyer1 is the owner of the ticket
    const isOwner = await ticketServiceInstance.checkOwnerTicket(buyer1, "a1");
    assert.equal(isOwner, true, "Buyer1 should be the owner of ticket a1");
  });

  it("should get all tickets of an owner", async function() {
    // Buy multiple tickets
    await ticketServiceInstance.buyTicket(buyer1, "a1", { 
      from: buyer1,
      value: 100000
    });
    
    await ticketServiceInstance.buyTicket(buyer1, "b1", { 
      from: buyer1,
      value: 200000
    });
    
    await ticketServiceInstance.buyTicket(buyer2, "c1", { 
      from: buyer2,
      value: 300000
    });
    
    // Get buyer1's tickets
    const buyer1Tickets = await ticketServiceInstance.getOwnerTickets(buyer1);
    assert.equal(buyer1Tickets.length, 2, "Buyer1 should have 2 tickets");
    
    // Check ticket IDs
    const ticketIds = buyer1Tickets.map(ticket => ticket.ticketId);
    assert.include(ticketIds, "a1", "Buyer1 should own ticket a1");
    assert.include(ticketIds, "b1", "Buyer1 should own ticket b1");
    
    // Get buyer2's tickets
    const buyer2Tickets = await ticketServiceInstance.getOwnerTickets(buyer2);
    assert.equal(buyer2Tickets.length, 1, "Buyer2 should have 1 ticket");
    assert.equal(buyer2Tickets[0].ticketId, "c1", "Buyer2 should own ticket c1");
  });

  it("should handle ticket not found", async function() {
    try {
      await ticketServiceInstance.checkIfAvailable("non-existent");
      assert.fail("Should have thrown an error for non-existent ticket");
    } catch (error) {
      assert(error.message.includes("Ticket does not exist"), "Expected 'Ticket does not exist' error");
    }
  });

  it("should fail when buying an already sold ticket", async function() {
    // Buy ticket a1
    await ticketServiceInstance.buyTicket(buyer1, "a1", { 
      from: buyer1,
      value: 100000
    });
    
    // Try to buy the same ticket again
    try {
      await ticketServiceInstance.buyTicket(buyer2, "a1", { 
        from: buyer2,
        value: 100000
      });
      assert.fail("Should have thrown an error when buying an already sold ticket");
    } catch (error) {
      assert(error.message.includes("Ticket is already sold"), "Expected 'Ticket is already sold' error");
    }
  });
});