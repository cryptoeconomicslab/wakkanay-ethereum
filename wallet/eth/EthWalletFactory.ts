import { IWallet } from '../interfaces/IWallet'
import { IWalletFactory } from '../interfaces/IWalletFactory'
import { EthWallet } from './EthWallet'
import * as ethers from 'ethers'
require('dotenv').config()

export class EthWalletFactory implements IWalletFactory {
  async fromPrivateKey(privateKey: string): Promise<IWallet> {
    // TODO: how to abstract Provider more?
    let provider
    if (process.env.ETH_NETWORK_NAME == 'development') {
      provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL)
    } else {
      provider = new ethers.providers.InfuraProvider(process.env.ETH_NETWORK_NAME, process.env.ETH_API_KEY)
    }
    return new EthWallet(new ethers.Wallet(privateKey, provider))
  }
}
