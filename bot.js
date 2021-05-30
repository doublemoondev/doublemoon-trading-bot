const ethers = require('ethers');

// Testnet
// const addresses = {
//   WBNB: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
//   DBM: '0xAfF3543F3811c7B667Bcb6bf321f05c3F6Bef96A',
//   factory: '0x423f7e596397dd3e44e57c9c98a3e032bd88d211',
//   router: '0xDd37A72531804570CE577A6b74974Ef927a16369',
//   recipient: 'Your address'
// }

// Mainnet
const addresses = {
  WBNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  DBM: '0x0314e5a39806C30D67B869EE1bCDABee7e08dE74',
  factory: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
  router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  recipient: 'Your address' // Change your address
}

// Setting random bnb price ~9-28$
const randomAmounts = ['0.03', '0.04', '0.05', '0.06', '0.07', '0.08', '0.09']
const waitingTime = 30000 // 30s

// Set private key of address recipient
const privateKey = 'Your private key';

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/'); // testnet: https://data-seed-prebsc-1-s1.binance.org:8545
const wallet = new ethers.Wallet(privateKey, provider);
const account = wallet.connect(provider);
const router = new ethers.Contract(
  addresses.router,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
  ],
  account
);

const init = async () => {
  while(1) {
    await swap();
    await sleep(waitingTime);
  }
}

const swap = async () => {
  const randomIndex = randomBetween(0, randomAmounts.length - 1);
  const amountIn = ethers.utils.parseEther(randomAmounts[randomIndex]);
  const amounts = await router.getAmountsOut(amountIn, [addresses.WBNB, addresses.DBM]);
  //Our execution price will be a bit different, we need some flexbility
  const amountOutMin = amounts[1].sub(amounts[1].div(10));
  console.log(`
    Buying new token
    =================
    tokenIn: ${amountIn.toString()} ${addresses.WBNB} (WBNB)
    tokenOut: ${amountOutMin.toString()} ${addresses.DBM}
  `);
  const tx = await router.swapExactETHForTokens(
    amountOutMin,
    [addresses.WBNB, addresses.DBM],
    addresses.recipient,
    Date.now() + 1000 * 60 * 10 //10 minutes
    , { value: amountIn }
  );
  const receipt = await tx.wait(); 
  console.log('Transaction receipt');
  console.log(receipt);
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function randomBetween(min, max) {  
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

init();
