import { IWallet } from '../interfaces/IWallet'
import { IWalletFactory } from '../interfaces/IWalletFactory'
import { TzWallet } from './TzWallet'
import { ConseilServerInfo, TezosWalletUtil } from 'conseiljs'

export class TzWalletFactory implements IWalletFactory {
  // Default ServerInfo won't connect to network
  conseilServerInfo: ConseilServerInfo = {
    url: '',
    apiKey: '',
    network: ''
  }

  constructor(conseilServerInfo?: ConseilServerInfo) {
    if (conseilServerInfo) {
      this.conseilServerInfo = conseilServerInfo
    }
  }

  async fromPrivateKey(privateKey: string): Promise<IWallet> {
    return new TzWallet(await TezosWalletUtil.restoreIdentityWithSecretKey(privateKey), this.conseilServerinfo)
  }
}
