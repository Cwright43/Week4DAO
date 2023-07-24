import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';

import Create from './Create';
import App from './App';
import Navigation from './Navigation';

// ABIs: Import your contract ABIs here
import DAO_ABI from '../abis/DAO.json'

// Config: Import your network config here
import config from '../config.json';

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading, votes }) => {

const [account, setAccount] = useState(null)
const [recipientBalance, setRecipientBalance] = useState(0)
const [accountBalance, setAccountBalance] = useState(0)

    const upVoteHandler = async (id) => {

    // Fetch accounts

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    try {

    const signer = await provider.getSigner()
    const transaction = await dao.connect(signer).upVote(id)
    await transaction.wait()

    } catch {
      window.alert('User rejected or transaction reverted - Upvote Handler')
    }

    setIsLoading(true)

  }

    const downVoteHandler = async (id) => {

    // Fetch accounts

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    try {

    const signer = await provider.getSigner()
    const transaction = await dao.connect(signer).downVote(id)
    await transaction.wait()

    } catch {
      window.alert('User rejected or transaction reverted - Downvote Handler')
    }

    setIsLoading(true)

  }

 const finalizeHandler = async (id) => {

  	try {

  	const signer = await provider.getSigner()
  	const transaction = await dao.connect(signer).finalizeProposal(id)
  	await transaction.wait()
  	} catch {
  		window.alert('User rejected or transaction reverted - Finalize Handler')
  	}

  	setIsLoading(true)

  }

  return (

    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Proposal Name</th>
          <th>Proposal Description</th>
          <th>Recipient Balance</th>
          <th>Recipient Account</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Up Votes</th>
          <th>Cast Up-Vote</th>
          <th>Down Votes</th>
          <th>Cast Down-Vote</th>
          <th>Total Votes</th>
          <th>Finalize</th>
          <th>Current User</th>
        </tr>
      </thead>
      <tbody>
      	{proposals.map((proposal, index) => (

      	<tr key={index}>
      		<td>{proposal.id.toString()}</td>
            <td>{proposal.name}</td>
            <td>{proposal.description}</td>
            <td>{ethers.utils.formatUnits(proposal.recipientBalance, "ether")}</td>
            <td>{proposal.recipient}</td>
            <td>{ethers.utils.formatUnits(proposal.amount, "ether")} ETH</td>
            <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
            <td style={{color:'green'}}>{proposal.upVotes.toString() / 10e18}</td>
            <td>
              {!proposal.finalized && !proposal.votes.account && (
                <Button 
                  variant="primary" 
                  style={{ width: '100%' }}
                  onClick={() => upVoteHandler(proposal.id)}
                  >
                  Up Vote
                </Button>
                )}
            </td>
            <td style={{color:'red'}}>{proposal.downVotes.toString() / 10e18}</td>
            <td>
              {!proposal.finalized && !proposal.votes.account && (
                <Button 
                  variant="primary" 
                  style={{ width: '100%' }}
                  onClick={() => downVoteHandler(proposal.id)}
                  >
                  Down Vote
                </Button>
                )}
            </td>
            <td>{(proposal.upVotes.toString() - proposal.downVotes.toString()) / 10e18}</td>
            <td>
            	{!proposal.finalized && (proposal.upVotes.toString() - proposal.downVotes.toString()) > quorum && (
            		<Button 
            			variant="primary" 
            			style={{ width: '100%' }}
            			onClick={() => finalizeHandler(proposal.id)}
            			>
            		  Finalize
            		</Button>
            	  )}
            </td>
            <td></td>
         </tr>

      		))}
      </tbody>
    </Table>
  );
}

export default Proposals;
