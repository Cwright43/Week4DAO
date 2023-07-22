import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Create from './Create';
import Proposals from './Proposals';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import DAO_ABI from '../abis/DAO.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  
  const [provider, setProvder] = useState(null)
  const [dao, setDao] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(0)

  const [account, setAccount] = useState(null)

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

          <p className='text-center' ><strong>GAY Treasury Balance:</strong> {treasuryBalance} ETH </p>
          <p className='text-center' >{account}</p>
          <p className='text-center'><strong>Quorum Requirement:</strong> {quorumAmount} ETH </p>

          <hr/>

          <Proposals 
            provider={provider} 
            dao={dao}
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


