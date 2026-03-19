// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/HissEscrow.sol";
import "./mock/MockAgentBook.sol";
import "./mock/MockERC20.sol";

contract HissEscrowTest is Test {
    HissEscrow public escrow;
    MockAgentBook public agentBook;
    MockERC20 public usdc;
    MockERC20 public dai;

    address public buyer = makeAddr("buyer");
    address public seller = makeAddr("seller");
    address public agent = makeAddr("agent");

    uint256 constant ETH_PRICE = 0.1 ether;
    uint256 constant USDC_PRICE = 100e6;
    uint256 constant NULL = 12345;

    function setUp() public {
        agentBook = new MockAgentBook();
        usdc = new MockERC20("USD Coin", "USDC", 6);
        dai = new MockERC20("Dai Stablecoin", "DAI", 18);
        escrow = new HissEscrow(address(agentBook), address(usdc));

        vm.deal(buyer, 10 ether);
        vm.deal(seller, 1 ether);
        usdc.mint(buyer, 10000e6);
    }

    // ===== createListing =====

    function test_createListing() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        HissEscrow.Listing memory l = escrow.getListing(NULL);
        assertEq(l.seller, seller);
        assertEq(l.token, address(0));
        assertEq(l.price, ETH_PRICE);
        assertTrue(l.active);
    }

    function test_createListing_erc20() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(usdc), USDC_PRICE);
        assertEq(escrow.getListing(NULL).token, address(usdc));
    }

    function test_createListing_revertsUnsupportedToken() public {
        vm.prank(seller);
        vm.expectRevert(HissEscrow.UnsupportedToken.selector);
        escrow.createListing(NULL, address(dai), 100e18);
    }

    function test_createListing_revertsZeroPrice() public {
        vm.prank(seller);
        vm.expectRevert(HissEscrow.ZeroAmount.selector);
        escrow.createListing(NULL, address(0), 0);
    }

    function test_createListing_revertsInvalidNullifier() public {
        vm.prank(seller);
        vm.expectRevert(HissEscrow.InvalidNullifier.selector);
        escrow.createListing(0, address(0), ETH_PRICE);
    }

    function test_createListing_revertsDifferentSeller() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        vm.expectRevert(HissEscrow.AlreadyHasListing.selector);
        escrow.createListing(NULL, address(0), 0.2 ether);
    }

    function test_createListing_updatePrice() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(seller);
        escrow.createListing(NULL, address(0), 0.2 ether);

        assertEq(escrow.getListing(NULL).price, 0.2 ether);
    }

    function test_createListing_reactivateAfterDeactivate() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(seller);
        escrow.deactivateListing(NULL);
        assertFalse(escrow.getListing(NULL).active);

        vm.prank(seller);
        escrow.createListing(NULL, address(0), 0.2 ether);
        assertTrue(escrow.getListing(NULL).active);
        assertEq(escrow.getListing(NULL).price, 0.2 ether);
    }

    function test_createListing_emitsEvent() public {
        vm.prank(seller);
        vm.expectEmit(true, true, false, true);
        emit HissEscrow.ListingCreated(NULL, seller, address(0), ETH_PRICE);
        escrow.createListing(NULL, address(0), ETH_PRICE);
    }

    // ===== deactivateListing =====

    function test_deactivateListing() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(seller);
        escrow.deactivateListing(NULL);

        assertFalse(escrow.getListing(NULL).active);
    }

    function test_deactivateListing_revertsNotSeller() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        vm.expectRevert(HissEscrow.NotSeller.selector);
        escrow.deactivateListing(NULL);
    }

    // ===== acceptListing =====

    function test_acceptListing_eth() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        HissEscrow.Order memory o = escrow.getOrder(0);
        assertEq(o.nullifier, NULL);
        assertEq(o.buyer, buyer);
        assertEq(o.agentAddress, agent);
        assertEq(o.amount, ETH_PRICE);
        assertFalse(o.resolved);
    }

    function test_acceptListing_erc20() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(usdc), USDC_PRICE);

        vm.startPrank(buyer);
        usdc.approve(address(escrow), USDC_PRICE);
        escrow.acceptListing(NULL, agent);
        vm.stopPrank();

        assertEq(usdc.balanceOf(address(escrow)), USDC_PRICE);
    }

    function test_acceptListing_revertsInactive() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);
        vm.prank(seller);
        escrow.deactivateListing(NULL);

        vm.prank(buyer);
        vm.expectRevert(HissEscrow.ListingNotActive.selector);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);
    }

    function test_acceptListing_revertsWrongPayment() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        vm.expectRevert(HissEscrow.WrongPayment.selector);
        escrow.acceptListing{value: 0.05 ether}(NULL, agent);
    }

    function test_acceptListing_revertsAlreadyRegistered() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);
        agentBook.register(agent, NULL);

        vm.prank(buyer);
        vm.expectRevert(HissEscrow.AgentAlreadyRegistered.selector);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);
    }

    function test_acceptListing_revertsPendingAgentOrder() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        address buyer2 = makeAddr("buyer2");
        vm.deal(buyer2, 10 ether);

        vm.prank(buyer2);
        vm.expectRevert(HissEscrow.AgentOrderPending.selector);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);
    }

    function test_acceptListing_erc20_revertsWithEth() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(usdc), USDC_PRICE);

        vm.startPrank(buyer);
        usdc.approve(address(escrow), USDC_PRICE);
        vm.expectRevert(HissEscrow.WrongPayment.selector);
        escrow.acceptListing{value: 0.01 ether}(NULL, agent);
        vm.stopPrank();
    }

    // ===== resolve =====

    function test_resolve_eth() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        agentBook.register(agent, NULL);

        uint256 sellerBefore = seller.balance;
        escrow.resolve(0);
        assertEq(seller.balance - sellerBefore, ETH_PRICE);
        assertTrue(escrow.getOrder(0).resolved);
    }

    function test_resolve_erc20() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(usdc), USDC_PRICE);

        vm.startPrank(buyer);
        usdc.approve(address(escrow), USDC_PRICE);
        escrow.acceptListing(NULL, agent);
        vm.stopPrank();

        agentBook.register(agent, NULL);

        uint256 sellerBefore = usdc.balanceOf(seller);
        escrow.resolve(0);
        assertEq(usdc.balanceOf(seller) - sellerBefore, USDC_PRICE);
    }

    function test_resolve_paysListingSeller() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        agentBook.register(agent, NULL);

        uint256 sellerBefore = seller.balance;
        vm.prank(makeAddr("random"));
        escrow.resolve(0);
        assertEq(seller.balance - sellerBefore, ETH_PRICE);
    }

    function test_resolve_revertsNullifierMismatch() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        agentBook.register(agent, 99999); // wrong nullifier

        vm.expectRevert(HissEscrow.NullifierMismatch.selector);
        escrow.resolve(0);
    }

    function test_resolve_revertsNotRegistered() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        vm.expectRevert(HissEscrow.AgentNotRegistered.selector);
        escrow.resolve(0);
    }

    function test_resolve_revertsAlreadyResolved() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        agentBook.register(agent, NULL);
        escrow.resolve(0);

        vm.expectRevert(HissEscrow.AlreadyResolved.selector);
        escrow.resolve(0);
    }

    function test_resolve_revertsOrderNotFound() public {
        vm.expectRevert(HissEscrow.OrderNotFound.selector);
        escrow.resolve(999);
    }

    // ===== cancelOrder =====

    function test_cancelOrder_eth() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        uint256 buyerBefore = buyer.balance;
        vm.prank(buyer);
        escrow.cancelOrder(0);
        assertEq(buyer.balance - buyerBefore, ETH_PRICE);
    }

    function test_cancelOrder_erc20() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(usdc), USDC_PRICE);

        vm.startPrank(buyer);
        usdc.approve(address(escrow), USDC_PRICE);
        escrow.acceptListing(NULL, agent);
        vm.stopPrank();

        uint256 buyerBefore = usdc.balanceOf(buyer);
        vm.prank(buyer);
        escrow.cancelOrder(0);
        assertEq(usdc.balanceOf(buyer) - buyerBefore, USDC_PRICE);
    }

    function test_cancelOrder_revertsNotBuyer() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        vm.prank(seller);
        vm.expectRevert(HissEscrow.NotBuyer.selector);
        escrow.cancelOrder(0);
    }

    function test_cancelOrder_revertsIfRegistered() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        agentBook.register(agent, NULL);

        vm.prank(buyer);
        vm.expectRevert(HissEscrow.AgentAlreadyRegistered.selector);
        escrow.cancelOrder(0);
    }

    function test_cancelOrder_revertsAlreadyResolved() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        vm.prank(buyer);
        escrow.cancelOrder(0);

        vm.prank(buyer);
        vm.expectRevert(HissEscrow.AlreadyResolved.selector);
        escrow.cancelOrder(0);
    }

    function test_cancelOrder_releasesPendingAgent() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        vm.prank(buyer);
        escrow.cancelOrder(0);

        address buyer2 = makeAddr("buyer2");
        vm.deal(buyer2, 10 ether);

        vm.prank(buyer2);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        assertEq(escrow.nextOrderId(), 2);
    }

    // ===== Price change mid-order =====

    function test_resolve_usesLockedPrice() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        // Buyer accepts at 0.1 ETH
        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        // Seller changes price to 0.2 ETH
        vm.prank(seller);
        escrow.createListing(NULL, address(0), 0.2 ether);

        // Resolve should pay 0.1 ETH (locked), not 0.2 ETH
        agentBook.register(agent, NULL);

        uint256 sellerBefore = seller.balance;
        escrow.resolve(0);
        assertEq(seller.balance - sellerBefore, ETH_PRICE);
    }

    // ===== Multiple buyers =====

    function test_multipleBuyersPerListing() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        address agent2 = makeAddr("agent2");
        address buyer2 = makeAddr("buyer2");
        vm.deal(buyer2, 10 ether);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        vm.prank(buyer2);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent2);

        assertEq(escrow.nextOrderId(), 2);
    }

    // ===== Griefing: third party registers agent with wrong nullifier =====

    function test_griefing_thirdPartyRegisters_buyerCanCancel() public {
        vm.prank(seller);
        escrow.createListing(NULL, address(0), ETH_PRICE);

        vm.prank(buyer);
        escrow.acceptListing{value: ETH_PRICE}(NULL, agent);

        // Attacker registers the agent with a different nullifier
        agentBook.register(agent, 99999);

        // Seller can't resolve (wrong nullifier)
        vm.expectRevert(HissEscrow.NullifierMismatch.selector);
        escrow.resolve(0);

        // Buyer CAN cancel (wrong nullifier = order can never resolve)
        uint256 buyerBefore = buyer.balance;
        vm.prank(buyer);
        escrow.cancelOrder(0);
        assertEq(buyer.balance - buyerBefore, ETH_PRICE);
    }

    // ===== constructor =====

    function test_constructor_revertsZeroAgentBook() public {
        vm.expectRevert(HissEscrow.ZeroAddress.selector);
        new HissEscrow(address(0), address(usdc));
    }

    function test_constructor_revertsZeroSupportedToken() public {
        vm.expectRevert(HissEscrow.ZeroAddress.selector);
        new HissEscrow(address(agentBook), address(0));
    }
}
