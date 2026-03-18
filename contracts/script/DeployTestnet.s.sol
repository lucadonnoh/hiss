// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/HissEscrow.sol";
import "../test/mock/MockAgentBook.sol";

contract DeployTestnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        MockAgentBook agentBook = new MockAgentBook();
        HissEscrow escrow = new HissEscrow(address(agentBook));

        vm.stopBroadcast();

        console.log("MockAgentBook:", address(agentBook));
        console.log("HissEscrow:", address(escrow));
    }
}
