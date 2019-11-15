import { IWallet } from '../interfaces/IWallet'
import { IWalletFactory } from '../interfaces/IWalletFactory'
import { TzWallet } from './TzWallet'
import { ConseilServerInfo, TezosWalletUtil } from 'conseiljs'
import dotenv from 'dotenv'
dotenv.config()

export class TzWalletFactory implements IWalletFactory {
  async fromPrivateKey(privateKey: string): Promise<IWallet> {
    const conseilServerinfo: ConseilServerInfo = {
      url: process.env.RPC_URL!,
      apiKey: process.env.API_KEY!,
      network: process.env.NETWORK_NAME!
    }
    return new TzWallet(await TezosWalletUtil.restoreIdentityWithSecretKey(privateKey), conseilServerinfo)
  }
}
