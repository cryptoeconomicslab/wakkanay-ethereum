import * as ethers from 'ethers'
import { EthWallet } from '../../wallet/eth/EthWallet'
import { IDepositContract } from '../interfaces/IDepositContract'
import { Property } from '../../ovm/types'
import { getConnection } from './helpers/getConnection'

const abi = [
  'function deposit(uint256 _amount, tuple(address, bytes[]) _initialState)',
  'function finalizeCheckpoint(tuple(address, bytes[]) _checkpoint)',
  'function finalizeExit(tuple(address, bytes[]) _exit, uint256 _depositedRangeId)'
]

export class DepositContract implements IDepositContract {
  wallet: EthWallet
  contractAddress: string
  connection: ethers.Contract
  gasLimit: number
  constructor(wallet: EthWallet, contractAddress: string) {
    this.wallet = wallet
    this.contractAddress = contractAddress
    this.connection = getConnection(wallet, contractAddress, abi)
    this.gasLimit = 200000
  }
  async deposit(amount: number, initialState: Property): Promise<void> {
    return await this.connection.deposit(amount, initialState, {
      gasLimit: this.gasLimit
    })
  }
  async finalizeCheckpoint(checkpoint: Property): Promise<void> {
    return await this.connection.deposit(checkpoint, {
      gasLimit: this.gasLimit
    })
  }
  async finalizeExit(exit: Property, depositedRangeId: number): Promise<void> {
    return await this.connection.deposit(exit, depositedRangeId, {
      gasLimit: this.gasLimit
    })
  }
}
