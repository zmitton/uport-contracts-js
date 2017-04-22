# uport-contracts-js

Promise-based contract objects used by the uport system. For Node and the browser. 

If you would instead like to see the solidity contract code that is used by this library, or a 'bare bones' library that does not require Web3, see [uport-contracts](https://github.com/zmitton/uport-contracts) instead.

### Install
```
$ npm install uport-contracts-js
```

### Initialization

First, set up a new web3 provider instance. Then require("uport-contracts-js") and create the Uport contract-objects with this provider

```javascript
const Web3 = require('web3')
const Uport = require('./index'); //change to require('uport-contracts-js')

var uport = new Uport(new Web3.providers.HttpProvider('https://kovan.infura.io/'))
```
Under the hood you have just created [truffle abstraction objects](https://github.com/trufflesuite/truffle-contract) for all of the uport contracts. For instance

```javascript
uport.Proxy            // Truffle 'contract abstraction object'
uport.IdentityFactory  // Truffle 'contract abstraction object'
uport.RegistryV3       // Truffle 'contract abstraction object'
```
#### Background
A Truffle 'contract abstraction' object is basically a class based on the definition of the ethereum contract, but it is not tied to a specific instance or deployment of the contract.
(See Truffle's [Contract Abstraction API)](https://github.com/trufflesuite/truffle-contract#contract-abstraction-api) for the full feature set.

The Truffle contract abstraction object can be used to deploy or follow an (already deployed) instance of the contract. This creates a Truffle 'contract instance' which can read and write to the contract using the Truffle [Contract Instance API](https://github.com/trufflesuite/truffle-contract#contract-instance-api)

#### Singleton Contracts
The `uport` variable from above exposes *all* our *contract abstractions* (using CapitalizedCamelCase) 

Furthermore, after calling the `deployed` function, it will initialize *contract instances* of *only* the contracts which "singleton contracts" (lowercaseCamelCase). For instance

```javascript
uport.deployed().then(function(){
  // Now the uport object is decorated with contract instances. Notice the lowercaseCamelCase
  console.log(uport.proxy)            // undefined
  console.log(uport.identityFactory)  // Truffle 'contract instance object'
  console.log(uport.registryV3)       // Truffle 'contract instance object'
})
```
Both the `identity factory` and uPort Registry (`registryV3`) are contracts which uPort has deployed onto the ethereum network. They both exist at a specific address and are intended to be shared by the community at large. I call these "singleton contracts". The `proxy` contract is not a singleton contract because it's something that each user has a separate deployment (instance) of.

The above function unfortunately is async, but if you specify a `network_id` you can execute it synchronously.
```javascript
uport.deployed(3)
uport.registryV3.address  // '0x5ef80c8db9ca50c85ba4ddf9910ed3854da293d8'
                          //   ^^^ actual registryV3 address value! ^^^
```
### Usage
Whether using node or the browser, the objects exposed can now be used with the `provider` given to them.

#### Reading a Contract 
Reading the uPort registry
```javascript
uport.registryV3.get.call('uPortProfileIPFS1220', '0xb08e78b8E17dC2874818d7F49055aBf08Ee9977D', '0xb08e78b8E17dC2874818d7F49055aBf08Ee9977D').then(function(attestationsAddress){
  console.log(attestationsAddress) // -> 0xb0f288f8efa511962e11e37488db0d2bcc7a5f304b1d4f3977eb0ec65814a52c
})
```
You can see some real data (`0xb0f2...`) from the blockchain. More info on how to actually *interpret* this data coming soon. 

#### Writing to/Deploying a Contract 
If your `provider` is a local Ethereum node, Metamask, Mist, or Parity, you will be able to write and deploy contracts as well.

Writing to the uPort registry
```javascript
uport.registryV3.set(
  'uPortProfileIPFS1220',
  web3.eth.coinbase,
  0x273EF783620B49D707885F6BBBCF1214CD0BC20D481FF31B00F67B612A5A53DD
).then(function(result){ /*Truffle result object */ })

Creating a Uport Account
```javascript
uport.identityFactory.CreateProxyWithControllerAndRecovery(
  web3.eth.coinbase,                             //userkey (controls account)
  [0xb08e78b8E17dC2874818d7F49055aBf08Ee9977D],  //delegates (for account recovery)
  259200,                                        //timeLock (3 days for account recovery)
  5                                              //shortTimeLock (5 sec. effectively none)
).then(function(result){
  console.log(result)                     // -> Truffle result object
  console.log(result.logs[0].args.proxy)  // -> Your new account address!
})
```
### API
Everything nested in the uport object follows the [truffle-contract](https://github.com/trufflesuite/truffle-contract) API. Therefore, the contract instance objects have promise-based functions corresponding to all their solidity function names. Its useful to view the solidity contract code which is [held here](https://github.com/zmitton/uport-contracts).

More to follow
-------
## JavaScript integration
Either install the package with npm in your `package.json` file:
```
"uport-contracts": "git://github.com/uport-project/uport-contracts.git#develop"
```
or simply download and include `dist.js` in an html file
```
<html>
  <head>
    <script type="text/javascript" src="dist.js"></script>
  </head>
  <body>
    This page has global access to the `UportContracts` and `Web3` javascript objects.
  </body>
</html>

```
The library exposes a `UportContracts` object which has all other contract objects nested in it (i.e. `UportContracts.Registry`). These objects are built using truffle-contract [see full API](https://github.com/trufflesuite/truffle-contract). They have promise-based functions corresponding to their solidity functions, and once initialized with a [web3](https://github.com/ethereum/web3.js/) `provider`, will know their deployed address corresponding to the provided network.

```javascript
Web3 = require('web3');

if (typeof web3 == 'undefined') {
  web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"));
}

UportContracts.Registry.setProvider(web3.currentProvider)
UportContracts.Registry.deployed().then(function(instance){
  uportRegistry = instance
  console.log("Registry Address (ropsten): ", uportRegistry.address)
  var someExistingUportAddress = "0x58471b238277224d2e1d0a3d07a40a9fe5bd485e"
  return uportRegistry.getAttributes.call(someExistingUportAddress)
}).then(function(encodedIpfsAddress) {
  console.log("SelfSigned Attributes: ", encodedIpfsAddress)
});

```

