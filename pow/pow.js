const SHA256 = require('crypto-js/sha256')
const hexToBinary = require('hex-to-binary')

// some POW constants
const BLOCK_GENERATION_INTERVAL = 10 * 100      // milliseconds
const DIFFICULTY_ADJUSTMENT_INT = 10      // number of new blocks added
const TIMER = 5 * 1000

  /*
    With Proof of Work, we introduce a computational puzzle that needs to be solved before a block can be added to the blockchain. 
    Trying to solve this puzzle is what people call mining...With Proof of Work, we can control the interval of how often a block
    is introduced to the blockchain. This is done by changing the difficulty of the puzzle. If blocks are mined too often, the 
    difficulty of the puzzle needs to increase and visa versa.

    We do not yet have transactions in this demo. Which means there is no real incentive for miners to generate a block. Generally
    miners are rewarded for solving the 'puzzle' with a block.
  */

class Block {
  /*
    Added properties in this section is difficulty and nonce.

    They are include for the following purposes:
    - Difficulty: This property defines how many prefixing zeros the block's binary hash must have to be valid.
    - Nonce: In order to find different hash values for the same block, we modify the nonce.
  */

  constructor(index, timestamp, data, previousHash, difficulty, nonce, hash) {
    this.index = index
    this.timestamp = timestamp
    this.data = data
    this.previousHash = previousHash
    this.difficulty = difficulty
    this.nonce = nonce
    this.hash = hash
  }

  _getIndex() {
    return this.index
  }

  _getDifficulty() {
    return this.difficulty
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

  createGenesis() {
    return new Block(0, Date.now(), "Genesis Block", "0", 3, 0)
  }

  // basic functions
  _latestBlock(){
    return this.chain[this.chain.length - 1]
  }

  _calculateHash(index, timestamp, data, previousHash, difficulty, nonce) {
    return SHA256(index + timestamp + data + previousHash + difficulty + nonce).toString()
  }


  // proof of work
  _hashMatchesDifficulty(hash, difficulty) {
    const hashInBinary = hexToBinary(hash)
    const requiredPrefix = '0'.repeat(difficulty)
    return hashInBinary.startsWith(requiredPrefix)
  }

  _findBlock( data, time, difficulty ) {
    let nonce = 0
    const prevBlock = this._latestBlock()
    const index = prevBlock._getIndex() + 1
    const prevHash = prevBlock._getHash()

    while (true) {
      const hash = this._calculateHash(index, time, data, prevHash, difficulty, nonce)
      
      if (this._hashMatchesDifficulty(hash, difficulty)){
        return new Block(index, time, data, prevHash, difficulty, nonce, hash)
      }
      nonce += 1
    }
  }

  _getDifficulty() {
    const latestBlock = this._latestBlock()

    if ((latestBlock._getIndex() % DIFFICULTY_ADJUSTMENT_INT === 0) && (latestBlock._getIndex() !== 0)){
      return this._getAdjustedDifficulty(latestBlock, this.chain)
    } else {
      return latestBlock._getDifficulty()
    }
  }

  _getAdjustedDifficulty(block) {
    let i = this.chain.length - DIFFICULTY_ADJUSTMENT_INT
    if (i < 0){
      i = 0
    }

    const prevAdjustmentBlock = this.chain[i]
    const expectedTime = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INT
    const timeTaken = block._getTimeStamp() - prevAdjustmentBlock._getTimeStamp()

    if (timeTaken < (expectedTime / 2)) {
      return prevAdjustmentBlock._getDifficulty()
    } else if (timeTaken > (expectedTime * 2)) {
      return prevAdjustmentBlock._getDifficulty()
    } else {
      return prevAdjustmentBlock._getDifficulty()
    }
  }

  _timeStampValidation(newBlock, prevBlock) {
    return (prevBlock._getTimeStamp() - (60 * 100) < newBlock._getTimeStamp()) && (newBlock._getTimeStamp() - (60 * 100) < Date.now())
  }

  _addBlock(newBlock){
    const prevBlock = this._latestBlock()
    const valid = this._timeStampValidation(newBlock, prevBlock)

    if (valid){
      this.chain.push(newBlock)
    } else {
      console.log('Not a valid block')
    }
  }
}

// doing some stuff
let blockChain = new Blockchain()


setInterval(() => {
  const difficult = blockChain._getDifficulty()
  const block = blockChain._findBlock("hello", Date.now(), difficult)
  blockChain._addBlock(block)

  console.log(JSON.stringify(blockChain, null, 4))
}, TIMER)