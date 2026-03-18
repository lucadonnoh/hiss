// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../src/interfaces/IAgentBook.sol";

contract MockAgentBook is IAgentBook {
    mapping(address => uint256) private _registrations;

    event AgentRegistered(address indexed agent, uint256 indexed humanId);

    function register(address agent, uint256 nullifierHash) external {
        _registrations[agent] = nullifierHash;
        emit AgentRegistered(agent, nullifierHash);
    }

    function unregister(address agent) external {
        delete _registrations[agent];
    }

    function lookupHuman(address agent) external view override returns (uint256) {
        return _registrations[agent];
    }
}
