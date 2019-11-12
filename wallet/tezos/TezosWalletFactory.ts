import { IWallet } from '../interfaces/IWallet'
import { IWalletFactory } from '../interfaces/IWalletFactory'
import { TezosWallet } from './TezosWallet'
import { ConseilServerInfo, TezosWalletUtil } from 'conseiljs'
require('dotenv').config()

export class TezosWalletFactory implements IWalletFactory {
  async fromPrivateKey(privateKey: string): Promise<IWallet> {
    const conseilServerinfo: ConseilServerInfo = {
      url: process.env.TEZOS_RPC_URL!,
      apiKey: process.env.TEZOS_API_KEY!,
      network: process.env.TEZOS_NETWORK_NAME!
    }
    return new TezosWallet(await TezosWalletUtil.restoreIdentityWithSecretKey(privateKey), conseilServerinfo)
  }
}
