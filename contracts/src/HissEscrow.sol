// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IAgentBook.sol";

contract HissEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Listing {
        address seller;
        address token;
        uint256 price;
        bool active;
    }

    struct Order {
        uint256 nullifier; // which listing (by nullifierHash)
        address buyer;
        address agentAddress;
        address token;
        uint256 amount;
        bool resolved;
    }

    IAgentBook public immutable agentBook;
    uint256 public nextOrderId;

    mapping(uint256 => Listing) public listings; // nullifierHash => Listing
    mapping(uint256 => Order) public orders;     // orderId => Order

    event ListingCreated(uint256 indexed nullifier, address indexed seller, address token, uint256 price);
    event ListingDeactivated(uint256 indexed nullifier);
    event OrderCreated(uint256 indexed orderId, uint256 indexed nullifier, address indexed buyer, address agentAddress, uint256 amount);
    event OrderResolved(uint256 indexed orderId, address indexed seller, uint256 payout);
    event OrderCancelled(uint256 indexed orderId);

    error NotSeller();
    error ListingNotActive();
    error AlreadyHasListing();
    error OrderNotFound();
    error AlreadyResolved();
    error AgentAlreadyRegistered();
    error AgentNotRegistered();
    error NullifierMismatch();
    error NotBuyer();
    error ZeroAmount();
    error ZeroAddress();
    error TransferFailed();
    error WrongPayment();
    error InvalidNullifier();

    constructor(address _agentBook) {
        if (_agentBook == address(0)) revert ZeroAddress();
        agentBook = IAgentBook(_agentBook);
    }

    // ===== Seller =====

    function createListing(uint256 nullifier, address token, uint256 price) external {
        if (nullifier == 0) revert InvalidNullifier();
        if (price == 0) revert ZeroAmount();
        Listing storage listing = listings[nullifier];
        if (listing.seller != address(0) && listing.seller != msg.sender) revert AlreadyHasListing();

        listing.seller = msg.sender;
        listing.token = token;
        listing.price = price;
        listing.active = true;

        emit ListingCreated(nullifier, msg.sender, token, price);
    }

    function deactivateListing(uint256 nullifier) external {
        Listing storage listing = listings[nullifier];
        if (listing.seller != msg.sender) revert NotSeller();
        listing.active = false;
        emit ListingDeactivated(nullifier);
    }

    // ===== Buyer =====

    function acceptListing(uint256 nullifier, address agentAddress) external payable nonReentrant {
        Listing storage listing = listings[nullifier];
        if (!listing.active) revert ListingNotActive();
        if (agentAddress == address(0)) revert ZeroAddress();
        if (agentBook.lookupHuman(agentAddress) != 0) revert AgentAlreadyRegistered();

        uint256 amount = listing.price;

        if (listing.token == address(0)) {
            if (msg.value != amount) revert WrongPayment();
        } else {
            if (msg.value != 0) revert WrongPayment();
            IERC20(listing.token).safeTransferFrom(msg.sender, address(this), amount);
        }

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            nullifier: nullifier,
            buyer: msg.sender,
            agentAddress: agentAddress,
            token: listing.token,
            amount: amount,
            resolved: false
        });

        emit OrderCreated(orderId, nullifier, msg.sender, agentAddress, amount);
    }

    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        if (order.buyer == address(0)) revert OrderNotFound();
        if (order.resolved) revert AlreadyResolved();
        if (msg.sender != order.buyer) revert NotBuyer();

        // Allow cancel if agent is unregistered OR registered by wrong nullifier
        uint256 registeredNullifier = agentBook.lookupHuman(order.agentAddress);
        if (registeredNullifier == order.nullifier) revert AgentAlreadyRegistered();

        order.resolved = true;
        emit OrderCancelled(orderId);
        _transfer(order.token, order.buyer, order.amount);
    }

    // ===== Resolution =====

    function resolve(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        if (order.buyer == address(0)) revert OrderNotFound();
        if (order.resolved) revert AlreadyResolved();

        uint256 registeredNullifier = agentBook.lookupHuman(order.agentAddress);
        if (registeredNullifier == 0) revert AgentNotRegistered();
        if (registeredNullifier != order.nullifier) revert NullifierMismatch();

        order.resolved = true;

        address seller = listings[order.nullifier].seller;
        uint256 payout = order.amount;

        emit OrderResolved(orderId, seller, payout);
        _transfer(order.token, seller, payout);
    }

    // ===== View =====

    function getListing(uint256 nullifier) external view returns (Listing memory) {
        return listings[nullifier];
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    // ===== Internal =====

    function _transfer(address token, address to, uint256 amount) internal {
        if (token == address(0)) {
            (bool success,) = to.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }
}
