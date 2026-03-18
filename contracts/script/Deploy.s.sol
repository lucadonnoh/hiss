// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/HissEscrow.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address agentBook = 0xE1D1D3526A6FAa37eb36bD10B933C1b77f4561a4;

        vm.startBroadcast(deployerPrivateKey);
        new HissEscrow(agentBook);
        vm.stopBroadcast();
    }
}
