import * as ethers from 'ethers'
import { Bytes } from '../types'
import Wallet = ethers.Wallet

const abi = ['function submit_root(uint64 blkNumber, bytes32 _root)']

export class CommitmentContract {
  wallet: Wallet
  contractAddress: string
  constructor(wallet: Wallet, contractAddress: string) {
    this.wallet = wallet
    this.contractAddress = contractAddress
  }
  async submit(blockNumber: number, root: Bytes) {
    const contract = new ethers.Contract(
      this.contractAddress,
      abi,
      this.wallet.provider
    )
    const connection = contract.connect(this.wallet)
    return await connection.submit_root(blockNumber, root, {
      gasLimit: 200000
    })
  }
}
