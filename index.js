const TruffleContract = require('truffle-contract')
const UportContractsJSON = require("uport-contracts")
const Web3 = require("web3")

class Uport{
  constructor(web3Provider){
    const self = this
    this.contractList = Object.keys(UportContractsJSON).map(function(contract_name) {   
      return contract_name
    })
    this.contractList.forEach(function(contract_name) {   
      self[contract_name] = new TruffleContract(UportContractsJSON[contract_name])
    })
    this.web3 = new Web3()
    if(web3Provider){ 
      this.setProvider(web3Provider)// also sets a new this.web3
    }
  }

  setProvider(provider){
    const self = this
    if(!provider){ throw Error('Error: Must specify a web3 provider')}
    this.web3 = new Web3(provider)
    this.contractList.forEach(function(contract_name) {
      self[contract_name].setProvider(provider)
    })
  }

  deployed(network_id){
    const self = this
    if(network_id){
      self.network_id = network_id
      self.contractList.forEach(function(contract_name) {
        self[contract_name].network_id = self.network_id
        if(self[contract_name].hasNetwork(self.network_id) && self[contract_name].networks[self.network_id].address){
          self[self._unCapitalize(contract_name)] = self[contract_name].at(self[contract_name].networks[self.network_id].address)
        }
      })
      return self
    }else{
      return new Promise(function(accept, reject) {
        if(self.web3.currentProvider){
          self.web3.version.getNetwork(function(e,network_id){
            if(e != null){ reject(e) }
            self.deployed(network_id)
            console.log("SEFL: ", self)
            accept(self)
          })
        }else{
          reject(new Error('Error: Use setProvider() first or init with a provider'))
        }
      })
    }
  }
  // deployed(){
  //   const self = this
  //   return new Promise(function(accept, reject) {
  //     if(self.web3.currentProvider){
  //       self.web3.version.getNetwork(function(e,network_id){
  //         if(e != null){ reject(e) }
  //         self.network_id = network_id
  //         self.contractList.forEach(function(contract_name) {
  //           self[contract_name].network_id = self.network_id
  //           if(self[contract_name].hasNetwork(self.network_id) && self[contract_name].networks[self.network_id].address){
  //             self[self._unCapitalize(contract_name)] = self[contract_name].at(self[contract_name].networks[self.network_id].address)
  //           }
  //         })
  //         accept(self)
  //       })
  //     }else{
  //       reject(new Error('Error: Use setProvider() first or init with a provider'))
  //     }
  //   })
  // }

  _unCapitalize(txt){
    return txt.replace(/^./, function (m) { return m.toLowerCase(); })
  }
}

module.exports = Uport

// var Web3 = require("web3")
// web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/'))//remove

// const Web3 = require('web3')
// const Uport = require('./lib'); //change to require('uport-contracts-js');
// uport = new Uport(new Web3.providers.HttpProvider('https://kovan.infura.io/'))
// uport.deployed().then(function(){ console.log(uport.identityFactory.address) })


