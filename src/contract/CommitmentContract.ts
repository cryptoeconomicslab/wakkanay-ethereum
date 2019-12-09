import * as ethers from 'ethers'
import { contract } from 'wakkanay'
import { Address, Bytes } from 'wakkanay/dist/types'
import ICommitmentContract = contract.ICommitmentContract

export class CommitmentContract implements ICommitmentContract {
  connection: ethers.Contract
  gasLimit: number
  public static abi = ['function submit_root(uint64 blkNumber, bytes32 _root)']
  constructor(address: Address, provider: ethers.providers.Provider) {
    this.connection = new ethers.Contract(
      address.raw,
      CommitmentContract.abi,
      provider
    )
    this.gasLimit = 200000
  }
  async submit(blockNumber: number, root: Bytes) {
    return await this.connection.submit_root(blockNumber, root, {
      gasLimit: this.gasLimit
    })
  }
}
