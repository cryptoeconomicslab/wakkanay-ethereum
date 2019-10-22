import { IWallet } from './IWallet'

export interface IWalletFactory {
  fromPrivateKey(privateKey: string): Promise<IWallet>
}
