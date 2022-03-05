# Collector's Swap Smart Contract 
## Abstract
Individual watch collectors and watch vendors suffer from authenticity issues in their merchandise, and potential buyers of such items fear fraudulent merchandise. This smart contract helps build trust in the watch community by allowing a centralized vendor to accept a queue of authenticity verification requests, fill those requests in a FIFO manner, and then allowing watch owners to transfer the verified watch entry to a new owner.
## Development
- Install node: https://nodejs.org/en/download/
- Run `npm i --save hardhat`
- Enter credentials & API endpoint in .env file
- To test, run `npx hardhat test`
- To deploy to ropsten, run `npx hardhat --network ropsten run scripts/deploy.js`

## Todos
- Add authenticity validation objects, so that an individual watch can get verified multiple times.