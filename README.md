# uport-contracts-js

Promise-based contract objects used by the uport system. For Node and the browser. 

If you would instead like to see the solidity contract code that is used by this library, or a 'bare bones' library that does not require Web3, see [uport-contracts](https://github.com/zmitton/uport-contracts) instead.

### Install
NPM
```
$ npm install uport-contracts-js
```
EASY MODE: download the `dist.js` and in your HTML file
```html
<html>
  <head> <script type="text/javascript" src="dist.js"></script> </head>
  <body> This page has global access to "Uport" (or "window.Uport") </body>
</html>
```
### Initialization

First, set up a new web3 provider instance. Then require("uport-contracts-js") and create the Uport contract-objects with this provider

```javascript
const Web3  = require('web3')
const Uport = require('uport-contracts-js')

var uport   = new Uport(new Web3.providers.HttpProvider('https://kovan.infura.io/'))
```
you've now have a `uport` object which has all other contract objects nested in it. *These* objects are [truffle abstraction objects](https://github.com/trufflesuite/truffle-contract).
For instance

```javascript
uport.Proxy            // Truffle 'contract abstraction object'
uport.IdentityFactory  // Truffle 'contract abstraction object'
uport.RegistryV3       // Truffle 'contract abstraction object'
```
#### Background
A Truffle 'contract abstraction' object is basically a class based on the definition of the ethereum contract, but it is not tied to a specific instance or deployment of the contract.
(See Truffle's [Contract Abstraction API)](https://github.com/trufflesuite/truffle-contract#contract-abstraction-api) for the full feature set.



The Truffle contract abstraction object can be used to deploy or follow an (already deployed) instance of the contract. This creates a Truffle 'contract instance' which can read and write to the contract using promise-based functions corresponding to their solidity functions. See [Contract Instance API](https://github.com/trufflesuite/truffle-contract#contract-instance-api)

#### Singleton Contracts
The `uport` variable from above exposes *all* our *contract abstractions* (using CapitalizedCamelCase) 

Furthermore, after calling the `deployed` function, it will initialize *contract instances* of *only* the contracts which are "singleton contracts" (lowercaseCamelCase). For instance the `identity factory` and uPort Registry (`registryV3`) are contracts which uPort has deployed onto the ethereum blockchain. These contracts exist at a specific address and are intended to be shared by the community. I call these "singleton contracts". The `proxy` contract is not a singleton contract because each user is intended to have a separate deployment (instance) of it.

```javascript
uport.deployed().then(function(){
  // Now the uport object is decorated with contract instances. Notice the lowercaseCamelCase
  console.log(uport.proxy)            // undefined
  console.log(uport.identityFactory)  // Truffle 'contract instance object'
  console.log(uport.registryV3)       // Truffle 'contract instance object'
})
```
The above function unfortunately is async, but if you specify a `network_id` you can execute it synchronously.
```javascript
uport.deployed(3)         // ropsten network_id == 3
uport.registryV3.address  // '0x5ef80c8db9ca50c85ba4ddf9910ed3854da293d8'
                          // ^^ magically knows the registryV3 address!
```
### Usage

#### Reading a Contract 
Reading the uPort registry
```javascript
uport.registryV3.get.call('uPortProfileIPFS1220', '0xb08e78b8E17dC2874818d7F49055aBf08Ee9977D', '0xb08e78b8E17dC2874818d7F49055aBf08Ee9977D').then(function(attestationsAddress){
  console.log(attestationsAddress) // -> 0xb0f288f8efa511962e11e37488db0d2bcc7a5f304b1d4f3977eb0ec65814a52c
})
```
You can see some real data (`0xb0f2...`) from the blockchain. More info on how to actually *interpret* this data coming soon. 

#### Writing to/Deploying a Contract 
If the `provider` is coming from Metamask, Mist, or Parity, you will be able to write and deploy contracts as well.

Writing to the uPort registry
```javascript
uport.registryV3.set(
  'uPortProfileIPFS1220',
  web3.eth.coinbase,
  0x273EF783620B49D707885F6BBBCF1214CD0BC20D481FF31B00F67B612A5A53DD
).then(function(result){ /*Truffle result object */ })
```
Creating a Uport Account
```javascript
uport.identityFactory.CreateProxyWithControllerAndRecovery(
  web3.eth.coinbase,                             //userkey (controls account)
  [web3.eth.accounts[1], web3.eth.accounts[2]],  //delegates (for account recovery)
  259200,                                        //timeLock (3 days for account recovery)
  5                                              //shortTimeLock (5 sec. effectively none)
).then(function(result){
  console.log(result)                     // -> Truffle result object
  console.log(result.logs[0].args.proxy)  // -> Your new account address!
})
```
### API
Everything nested in the uport object follows the [truffle-contract](https://github.com/trufflesuite/truffle-contract) API. The contract instance objects have promise-based functions corresponding to all their solidity function names. Therefore its useful to view the solidity contract code which is [held here](https://github.com/zmitton/uport-contracts).

More to follow
-------







