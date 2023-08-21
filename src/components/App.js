import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Create from './Create';
import Proposals from './Proposals';
import Loading from './Loading';
import Button from 'react-bootstrap/Button';

// ABIs: Import your contract ABIs here
import DAO_ABI from '../abis/DAO.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  
  const [provider, setProvder] = useState(null)
  const [dao, setDao] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(0)

  const [account, setAccount] = useState(null)
  const [accountRecipient, setAccountRecipient] = useState(null)
  const [accountBalance, setAccountBalance] = useState(0)

  const [proposals, setProposals] = useState(null)
  const [quorum, setQuorum] = useState(null)
  const [quorumAmount, setQuorumAmount] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvder(provider)

    // Initiate contracts
    const dao = new ethers.Contract(config[31337].dao.address, DAO_ABI, provider)
    setDao(dao)

    let treasuryBalance = await provider.getBalance(dao.address)
    treasuryBalance = ethers.utils.formatUnits(treasuryBalance, 18)
    setTreasuryBalance(treasuryBalance)

    // Fetch price
    const quorumAmount = ethers.utils.formatUnits(await dao.quorum(), 18)
    setQuorumAmount(quorumAmount)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Fetch accounts
    const accountRecipient = ethers.utils.getAddress(accounts[1])
    setAccountRecipient(accountRecipient)

    let accountBalance = await provider.getBalance(accountRecipient)
    accountBalance = ethers.utils.formatUnits(accountBalance, 18)
    setAccountBalance(accountBalance)

    // Fetch proposals count
    const count = await dao.proposalCount()
    const items = []

    for(var i = 0; i < count; i++) {
      const proposal = await dao.proposals(i + 1)
      items.push(proposal)
    }

    setProposals(items)

    // Fetching the quorum
    setQuorum(await dao.quorum())

    console.log()

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>Welcome to our DAO</h1>


      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Create 
            provider={provider}
            dao={dao}
            setIsLoading={setIsLoading}
          />
          <hr/>

          <p className='text-left' ><strong>Active User Account: </strong>{account}</p>
          <p className='text-left' ><strong>Treasury Balance:</strong> {treasuryBalance} ETH </p>
          <p className='text-left' ><strong>Account Balance:</strong> {accountBalance}</p>
          <p className='text-left'><strong>Quorum Requirement:</strong> {quorumAmount} ETH </p>
          <p>
              {( account == 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 &&
                <Button 
                  variant="primary" 
                  style={{ width: '100%' }}
                  >
                  Test Button
                </Button>
                    )}

          </p>

          <hr/>

          <Proposals 
            provider={provider} 
            dao={dao}
            account={account}
            proposals={proposals}
            quorum={quorum}
            setIsLoading={setIsLoading}
            

            />
        </>
      )}
    </Container>
  )
}

export default App;


