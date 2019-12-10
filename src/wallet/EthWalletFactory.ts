import { wallet } from 'wakkanay'
import { InMemoryKeyValueStore } from 'wakkanay/dist/db'
import { EthWallet } from './EthWallet'
import * as ethers from 'ethers'
import IWallet = wallet.IWallet
import IWalletFactory = wallet.IWalletFactory
import Provider = ethers.providers.Provider
import { Bytes } from 'wakkanay/dist/types'

export class EthWalletFactory implements IWalletFactory {
  // Default provider will connect to eth main net
  provider: Provider = ethers.getDefaultProvider()
  constructor(provider?: Provider) {
    if (provider) {
      this.provider = provider
    }
  }

  async fromPrivateKey(privateKey: string): Promise<IWallet> {
    const kvs = new InMemoryKeyValueStore(Bytes.fromString('kvs'))
    return new EthWallet(new ethers.Wallet(privateKey, this.provider), kvs)
  }
}
