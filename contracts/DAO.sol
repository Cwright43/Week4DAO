//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {
   
   // The person that creates the DAO
	address owner;
	Token public token;
	uint256 public quorum;

	struct Proposal {
		uint256 id;
		string name;
		uint256 amount;
		string description;
		address payable recipient;
		uint256 recipientBalance;
		uint256 votes;
		uint256 upVotes;
		uint256 downVotes;
		bool finalized;
	}

	uint256 public proposalCount;
	uint256 public recipientBalance;
	string public description;

	mapping(uint256 => Proposal) public proposals;
	mapping(address => mapping(uint256 => bool)) votes;
	mapping(address => mapping(uint256 => bool)) upVotes;
	mapping(address => mapping(uint256 => bool)) downVotes;
	

	event Propose(
		uint id,
		uint256 amount,
		address recipient,
		address creator
	);

	event Vote(uint256 id, address investor);
	event UpVote(uint256 id, address investor);
	event DownVote(uint256 id, address investor);
	event Finalize(uint256 id);

	constructor(Token _token, uint256 _quorum) {
		owner = msg.sender;
		token = _token;
		quorum = _quorum;
	}

	// Allow contract to receive ether
	receive() external payable {}

	modifier onlyInvestor() {
				require(
					token.balanceOf(msg.sender) > 0, 
					'must be token holder'
			);
			_;
	}


	function createProposal(string memory _name, string memory _description, uint256 _amount, address payable _recipient
		) external onlyInvestor {

		require(address(this).balance >= _amount);

		// Adds a count every time the function is counted
		proposalCount++;

		description = _description;

		recipientBalance = address(_recipient).balance;

		console.log(recipientBalance);

		// Create a proposal - we are going to MODEL the proposal itself
		
		// Populate the mapping
		proposals[proposalCount] = Proposal(
		proposalCount, 
		_name, 
		_amount,
		description, 
		_recipient, 
		recipientBalance,
		0, 
		0,
		0,
		false
		);

		emit Propose(proposalCount, _amount, _recipient, msg.sender);
		
	}

	// Vote on proposal - THIS WILL EVENTUALLY GO AWAY

	function vote(uint256 _id) external onlyInvestor {
		// Fetch proposal from mapping by id

		Proposal storage proposal = proposals[_id];

		// Don't let investors vote twice
		// Input will return TRUE, meaning they have voted, and FALSE if they haven't, which is what we want
		
		require(!votes[msg.sender][_id], "already voted");

		// Update votes

		proposal.votes += token.balanceOf(msg.sender);

		// Track that user has voted
		votes[msg.sender][_id] = true;

		// Emit an event
		emit Vote(_id, msg.sender);
	}

	// Vote on proposal - UP votes

	function upVote(uint256 _id) external onlyInvestor {
		// Fetch proposal from mapping by id

		Proposal storage proposal = proposals[_id];

		require(!votes[msg.sender][_id], "already voted");

		// Update votes

		proposal.upVotes += token.balanceOf(msg.sender);

		// Track that user has voted
		votes[msg.sender][_id] = true;

		// Emit an event
		emit UpVote(_id, msg.sender);
	}

	// Vote on proposal - DOWN votes

	function downVote(uint256 _id) external onlyInvestor {
		// Fetch proposal from mapping by id

		Proposal storage proposal = proposals[_id];

		require(!votes[msg.sender][_id], "already voted");

		// Update votes
		proposal.downVotes += token.balanceOf(msg.sender);

		// Track that user has voted
		votes[msg.sender][_id] = true;

		// Emit an event
		emit DownVote(_id, msg.sender);
	}

	// Finalize proposal & transfer funds
	function finalizeProposal(uint256 _id) external onlyInvestor {

		// Fetch proposal
		Proposal storage proposal = proposals[_id];

		// Ensure proposal is not already finalized
		require(proposal.finalized == false, "proposal already finalized");

		// Mark as "finalized" (boolean)
		proposal.finalized = true;

		// Check that proposal has enough votes in order to pass - pretty simple
		require((proposal.upVotes - proposal.downVotes) >= quorum, "must reach quorum to finalize proposal");

		// Check that the contract has enough ether
		require(address(this).balance >= proposal.amount);

		// Transfer the funds

		(bool sent, ) = proposal.recipient.call{value: proposal.amount}("");
		require(sent);

		proposal.recipientBalance = address(proposal.recipient).balance;

		// Emit Event
		emit Finalize(_id);
		
	}

}
