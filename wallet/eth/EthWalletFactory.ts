import { IWallet } from '../interfaces/IWallet'
import { IWalletFactory } from '../interfaces/IWalletFactory'
import { EthWallet } from './EthWallet'
import * as ethers from 'ethers'
import dotenv from 'dotenv'
dotenv.config()

export class EthWalletFactory implements IWalletFactory {
  async fromPrivateKey(privateKey: string): Promise<IWallet> {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
    return new EthWallet(new ethers.Wallet(privateKey, provider))
  }
}
