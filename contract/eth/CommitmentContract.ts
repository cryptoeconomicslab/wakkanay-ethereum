import * as ethers from 'ethers'
import { Bytes } from '../../types/Codables'
import { EthWallet } from '../../wallet/eth/EthWallet'
import { ICommitmentContract } from '../interfaces/ICommitmentContract'

const abi = ['function submit_root(uint64 blkNumber, bytes32 _root)']

export class CommitmentContract implements ICommitmentContract {
  wallet: EthWallet
  contractAddress: string
  constructor(wallet: EthWallet, contractAddress: string) {
    this.wallet = wallet
    this.contractAddress = contractAddress
  }
  async submit(blockNumber: number, root: Bytes) {
    const ethersWallet = this.wallet.getEthersWallet()
    const contract = new ethers.Contract(
      this.contractAddress,
      abi,
      ethersWallet.provider
    )
    const connection = contract.connect(ethersWallet)
    return await connection.submit_root(blockNumber, root, {
      gasLimit: 200000
    })
  }
}
