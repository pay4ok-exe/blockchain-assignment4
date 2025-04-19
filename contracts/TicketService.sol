// contracts/TicketService.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@tw3/solidity/contracts/utils/String.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract TicketService is Ownable {

    using String for string;

    struct Ticket {
        string ticketId;
        uint256 cost;
        address owner;
    }

    Ticket[] private tickets;

    constructor(address owner) Ownable(owner) {
        // Creates tickets
        tickets.push(Ticket("a1", 100000, address(0)));
        tickets.push(Ticket("a2", 100000, address(0)));
        tickets.push(Ticket("a3", 100000, address(0)));
        tickets.push(Ticket("a4", 100000, address(0)));

        tickets.push(Ticket("b1", 200000, address(0)));
        tickets.push(Ticket("b2", 200000, address(0)));
        tickets.push(Ticket("b3", 200000, address(0)));
        tickets.push(Ticket("b4", 200000, address(0)));

        tickets.push(Ticket("c1", 300000, address(0)));
        tickets.push(Ticket("c2", 300000, address(0)));
        tickets.push(Ticket("c3", 300000, address(0)));
        tickets.push(Ticket("c4", 300000, address(0)));
    }

    function addTicket(Ticket memory ticket) public onlyOwner {
        // Adds a ticket
        require(ticket.ticketId.length() > 0, "Ticket ID cannot be empty");
        require(ticket.cost > 0, "Ticket cost must be greater than 0");
        tickets.push(ticket);
    }

    function getTicketIndex(string memory ticketId) private view returns(uint256 index) {
        // Returns ticket index by ticketId
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].ticketId.equals(ticketId)) {
                return i;
            }
        }
        revert("Ticket does not exist");
    }

    function getAvailableTickets() public view returns(Ticket[] memory availableTickets) {
        // Returns available tickets (owner is null)
        uint256 availableCount = 0;
        
        // Count available tickets
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].owner == address(0)) {
                availableCount++;
            }
        }
        
        // Create result array
        availableTickets = new Ticket[](availableCount);
        
        // Fill result array
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].owner == address(0)) {
                availableTickets[currentIndex] = tickets[i];
                currentIndex++;
            }
        }
        
        return availableTickets;
    }

    function checkIfAvailable(string memory ticketId) public view returns(bool isAvailable) {
        // Checks if a ticket is available by ticketId
        uint256 index = getTicketIndex(ticketId);
        return tickets[index].owner == address(0);
    }

    function buyTicket(address owner, string memory ticketId) public payable {
        // Buys a ticket by ticketId
        uint256 index = getTicketIndex(ticketId);
        
        require(tickets[index].owner == address(0), "Ticket is already sold");
        require(msg.value >= tickets[index].cost, "Insufficient funds");
        
        // Refund excess payment
        if (msg.value > tickets[index].cost) {
            payable(msg.sender).transfer(msg.value - tickets[index].cost);
        }
        
        // Assign ticket to new owner
        tickets[index].owner = owner;
    }

    function checkOwnerTicket(address owner, string memory ticketId) public view returns(bool isOwner) {
        // Checks if ticketId is owned by owner
        uint256 index = getTicketIndex(ticketId);
        return tickets[index].owner == owner;
    }

    function getOwnerTickets(address owner) public view returns(Ticket[] memory ownerTickets) {
        // Returns all tickets of the given owner
        uint256 ownerTicketCount = 0;
        
        // Count owner's tickets
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].owner == owner) {
                ownerTicketCount++;
            }
        }
        
        // Create result array
        ownerTickets = new Ticket[](ownerTicketCount);
        
        // Fill result array
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].owner == owner) {
                ownerTickets[currentIndex] = tickets[i];
                currentIndex++;
            }
        }
        
        return ownerTickets;
    }
}