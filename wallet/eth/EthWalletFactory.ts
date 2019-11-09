import { IWallet } from '../interfaces/IWallet'
import { IWalletFactory } from '../interfaces/IWalletFactory'
import { EthWallet } from './EthWallet'
import * as ethers from 'ethers'

export class EthWalletFactory implements IWalletFactory {
  async fromPrivateKey(privateKey: string): Promise<IWallet> {
    // connecting to eth main net
    return new EthWallet(
      new ethers.Wallet(privateKey, ethers.getDefaultProvider())
    )
  }
}
