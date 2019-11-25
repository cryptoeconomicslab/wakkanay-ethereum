import * as ethers from 'ethers'
import { contract, types } from 'wakkanay'
import Bytes = types.Bytes
import ICommitmentContract = contract.ICommitmentContract

export class CommitmentContract implements ICommitmentContract {
  connection: ethers.Contract
  gasLimit: number
  public static abi = ['function submit_root(uint64 blkNumber, bytes32 _root)']
  constructor(connection: ethers.Contract) {
    this.connection = connection
    this.gasLimit = 200000
  }
  async submit(blockNumber: number, root: Bytes) {
    return await this.connection.submit_root(blockNumber, root, {
      gasLimit: this.gasLimit
    })
  }
}
