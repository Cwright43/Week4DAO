import { useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import { ethers } from 'ethers'

const Proposals = ({ provider, dao, proposals, quorum, description, setIsLoading }) => {

const [account, setAccount] = useState(null)

  const voteHandler = async (id) => {

    // Fetch accounts

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

  	try {

  	const signer = await provider.getSigner()
  	const transaction = await dao.connect(signer).vote(id)
  	await transaction.wait()



  	} catch {
  		window.alert('User rejected or transaction reverted BITCH')
  	}

  	setIsLoading(true)

  }

 const finalizeHandler = async (id) => {

  	try {

  	const signer = await provider.getSigner()
  	const transaction = await dao.connect(signer).finalizeProposal(id)
  	await transaction.wait()
  	} catch {
  		window.alert('User rejected or transaction reverted BITCH')
  	}

  	setIsLoading(true)

  }

  return (

    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Proposal Name</th>
          <th>{account}</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Description</th>
          <th>Cast Up-Vote</th>
          <th>Cast Down-Vote</th>
          <th style={{color:'green'}}>Up Votes</th>
          <th style={{color:'red'}}>Down Votes</th>
          <th>Total Votes</th>
          <th>Cast Vote</th>
          <th>Finalize</th>
        </tr>
      </thead>
      <tbody>
      	{proposals.map((proposal, index) => (

      	<tr key={index}>
      		<td>{proposal.id.toString()}</td>
            <td>{proposal.name}</td>
            <td>{proposal.recipient}</td>
            <td>{ethers.utils.formatUnits(proposal.amount, "ether")} ETH</td>
            <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
            <td>{proposal.description}</td>
            <td>
              {!proposal.finalized && (
                <Button 
                  variant="primary" 
                  style={{ width: '100%' }}
                  onClick={() => voteHandler(proposal.id)}
                  >
                  Up Vote
                </Button>
                )}
            </td>
            <td>
              {!proposal.finalized && (
                <Button 
                  variant="primary" 
                  style={{ width: '100%' }}
                  onClick={() => voteHandler(proposal.id)}
                  >
                  Down Vote
                </Button>
                )}
            </td>
            <td></td>
            <td></td>
            <td>{proposal.votes.toString() / 10e18}</td>
            <td>
            	{!proposal.finalized && proposal.votes == 0 && (
            		<Button 
            			variant="primary" 
            			style={{ width: '100%' }}
            			onClick={() => voteHandler(proposal.id)}
            			>
            		  Vote
            		</Button>
            		)}
            </td>
            <td>
            	{!proposal.finalized && proposal.votes > quorum && (
            		<Button 
            			variant="primary" 
            			style={{ width: '100%' }}
            			onClick={() => finalizeHandler(proposal.id)}
            			>
            		  Finalize
            		</Button>
            	  )}
            </td>
         </tr>
      		))}
      </tbody>
    </Table>
  );
}

export default Proposals;
