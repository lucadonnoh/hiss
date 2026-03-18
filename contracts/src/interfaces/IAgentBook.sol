// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgentBook {
    function lookupHuman(address agent) external view returns (uint256);
}
