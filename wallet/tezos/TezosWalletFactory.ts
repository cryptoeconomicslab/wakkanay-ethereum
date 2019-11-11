import { IWallet } from '../interfaces/IWallet'
import { IWalletFactory } from '../interfaces/IWalletFactory'
import { TezosWallet } from './TezosWallet'
import { TezosWalletUtil } from 'conseiljs'

export class TezosWalletFactory implements IWalletFactory {
  async fromPrivateKey(privateKey: string): Promise<IWallet> {
    return new TezosWallet(await TezosWalletUtil.restoreIdentityWithSecretKey(privateKey))
  }
}
