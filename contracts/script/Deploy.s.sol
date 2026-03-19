// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/HissEscrow.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address agentBook = 0xE1D1D3526A6FAa37eb36bD10B933C1b77f4561a4;
        address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

        vm.startBroadcast(deployerPrivateKey);
        new HissEscrow(agentBook, usdc);
        vm.stopBroadcast();
    }
}
