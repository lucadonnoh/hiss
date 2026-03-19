// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/HissEscrow.sol";
import "../test/mock/MockAgentBook.sol";
import "../test/mock/MockERC20.sol";

contract DeployTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        MockAgentBook agentBook = new MockAgentBook();
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6);
        HissEscrow escrow = new HissEscrow(address(agentBook), address(usdc));

        vm.stopBroadcast();

        console.log("MockAgentBook:", address(agentBook));
        console.log("MockUSDC:", address(usdc));
        console.log("HissEscrow:", address(escrow));
    }
}
