const SHA256 = require('crypto-js/sha256')
const TIMER = 5 * 1000
const TYPE = [
  'payment',
  'deposit',
  'interest'
]

class Block {
  constructor(index, timestamp, data, previousHash, hash) {
    this.index = index
    this.timestamp = timestamp
    this.data = data
    this.previousHash = previousHash
    this.hash = hash
  }

  _getIndex() {
    return this.index
  }

  _getTimeStamp() {
    return this.timestamp
  }

  _getHash() {
    return this.hash
  }

  _getPrevHash() {
    return this.previousHash
  }
}

class Blockchain {
  constructor(){
    this.chain = [this.createGenesis()]
  }

  /*
    This class has a few basic methods. Important to note, when we start a new chain we initialise it with a genesis block.
  */

  createGenesis() {
    return new Block(0, new Date(Date.now()), "Genesis Block", "0")
  }

  _latestBlock(){
    return this.chain[this.chain.length - 1]
  }

  _calculateHash(index, timestamp, data, previousHash) {
    return SHA256(index + timestamp + data + previousHash).toString()
  }

  _generateNewBlock(blockData = '') {
    const prevBlock = this._latestBlock()
    const index = prevBlock._getIndex() + 1
    const time = new Date()
    const hash = this._calculateHash(index, time, blockData, prevBlock._getHash())

    return new Block(index, time, blockData, prevBlock._getHash(), hash)
  }

  _addNewBlock(blockData = ''){
    const newBlock = this._generateNewBlock(blockData)
    const prevBlock = this._latestBlock()

    const valid = this._isValidNewBlock(newBlock, prevBlock)
    
    if (valid) {
      this.chain.push(newBlock)
    } else {
      console.log('No block added')
    }
  }

  _isValidNewBlock(newBlock, prevBlock){
    if(prevBlock._getIndex() + 1 !== newBlock._getIndex()){
      console.log('Invalid index')
      return false
    } else if (prevBlock._getHash() !== newBlock._getPrevHash()){
      console.log('Hashes does not match up')
      return false
    }

    return true
  }

  _isValidChain() {
    for (let i = 1; i < this.chain.length; i++) {
      if(!this._isValidNewBlock(this.chain[i], this.chain[i-1])){
        return false
      }
    }

    return true
  }
}

let chain = new Blockchain()

setInterval(() => {
  chain._addNewBlock({"transaction": {
    "type": Math.floor(Math.random() * 3),
    "recipient": 'Johann Venter',
    "amount (ZAR)": Math.floor(Math.random() * 1500)
  }})

  console.log(JSON.stringify(chain, null, 4))
  console.log('Is this chain valid? ', chain._isValidChain() ? 'Yes' : 'No')
}, TIMER)