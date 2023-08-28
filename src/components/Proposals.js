import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

const Proposals = ({ provider, dao, account, proposals, quorum, setIsLoading }) => {

const [activeAccount, setActiveAccount] = useState(null)
const [recipientBalance, setRecipientBalance] = useState(0)
const [accountBalance, setAccountBalance] = useState(0)
const [hasVoted, setHasVoted] = useState(false)

// Talk to smart contract and call upvotes function
// Pass in address and pass in proposal ID
// Returns T/F from smart contract

const hasUpVoted = async (account, id) => {
    
   const transaction = await dao.votes(account, id)
   Array.isArray(transaction)
   console.log(transaction)
   

   setIsLoading(false)

  }

const upVoteHandler = async (id) => {

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

  const showBooleanHandler = async (id) => {

    try {

      const transaction = hasUpVoted(account, id)

      console.log(`${transaction}`)

    } catch {
      window.alert('User rejected or transaction reverted - Boolean Handler')
    }

   //  setIsLoading(true)

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
          <th>Boolean Button</th>
        </tr>
      </thead>
      <tbody>
      	{proposals.map((proposal, index) => (

      	<tr key={index}>
      		<td>{proposal.id.toString()}</td>
            <td>{proposal.name}</td>
            <td>{proposal.description}</td>
            <td>{ethers.utils.formatUnits(proposal.recipientBalance, "ether")}</td>
            <td>{proposal.recipient.slice(0, 5) + ' ... ' + proposal.recipient.slice(39, 42) }</td>
            <td>{ethers.utils.formatUnits(proposal.amount, "ether")} ETH</td>
            <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
            <td style={{color:'green'}}>{proposal.upVotes.toString() / 10e18}</td>
            <td>
              {!proposal.finalized && hasUpVoted(account, proposal.id) && ( 
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
              {!proposal.finalized && !hasUpVoted(account, proposal.id) &&  (
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
            <td>
                <Button 
                  variant="primary" 
                  style={{ width: '100%' }}
                  onClick={() => showBooleanHandler(proposal.id)}
                  >
                  Show Boolean
                </Button>
            </td>
         </tr>
      		))}
      </tbody>
    </Table>
  );
}

export default Proposals;
