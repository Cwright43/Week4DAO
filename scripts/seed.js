// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const config = require('../src/config.json');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

async function main() {

  console.log(`Fetching accounts & network...\n`)

  const accounts = await ethers.getSigners()
  const funder = accounts[0]
  const investor1 = accounts[1]
  const investor2 = accounts[2]
  const investor3 = accounts[3]
  const recipient = accounts[4]

  let transaction

    // Fetch network
  const { chainID } = await ethers.provider.getNetwork()
  console.log(chainID)

    console.log(`Fetching token and transferring to accounts... \n`)

    const token = await ethers.getContractAt('Token', '0x5FbDB2315678afecb367f032d93F642f64180aa3')
    console.log(`Token fetched: ${token.address}\n`)

    transaction = await token.transfer(investor1.address, tokens(200000))
    await transaction.wait()

    transaction = await token.transfer(investor2.address, tokens(200000))
    await transaction.wait()

    transaction = await token.transfer(investor3.address, tokens(200000))
    await transaction.wait()

      console.log(`Fetching dao...\n`)

      //Fetching deployed DAO
      const dao = await ethers.getContractAt('DAO', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
      console.log(`DAO fetched:${dao.address}\n`)

      //Funder sends Ether to DAO treasury
      transaction = await funder.sendTransaction({ to: dao.address, value: ether(1000) }) // 1,000 Ether
      await transaction.wait()
      console.log(`Sent funds to dao treasury...\n`)

      // A for-loop with 3 iterations

      for ( var i = 0; i < 3; i++) {

      // Create proposal
      transaction = await dao.connect(investor1).createProposal(`Proposal ${i + 1}`, ether(100), recipient.address)
      await transaction.wait()

      // Vote 1
      transaction = await dao.connect(investor1).vote(i + 1)
      await transaction.wait()

      // Vote 2
      transaction = await dao.connect(investor2).vote(i + 1)
      await transaction.wait()

      // Vote 3
      transaction = await dao.connect(investor3).vote(i + 1)
      await transaction.wait()

      // Finalize
      transaction = await dao.connect(investor1).finalizeProposal(i + 1)
      await transaction.wait()

       console.log(`Created & Finalized Proposal ${i + 1}\n`)

    }

      console.log(`Creating one more proposal...\n`)


      // Create one more proposal
      transaction = await dao.connect(investor1).createProposal(`Proposal 4`, ether(100), recipient.address)
      await transaction.wait()

      // Vote 1
      transaction = await dao.connect(investor2).vote(4)
      await transaction.wait()

      // Vote 2
      transaction = await dao.connect(investor3).vote(4)
      await transaction.wait()

      console.log(`Finished.\n`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
