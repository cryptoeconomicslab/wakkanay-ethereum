import { IWallet } from '../interfaces/IWallet'
import * as ethers from 'ethers'

export class EthWallet implements IWallet {
  ethersWallet: ethers.Wallet
  constructor(ethersWallet: ethers.Wallet) {
    this.ethersWallet = ethersWallet
  }
  getEthersWallet(): ethers.Wallet {
    return this.ethersWallet
  }
  signMessage(message: string): Promise<string> {
    return this.ethersWallet.signMessage(message)
  }
}
