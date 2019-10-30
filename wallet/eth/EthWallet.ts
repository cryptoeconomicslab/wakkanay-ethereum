import { IWallet } from '../interfaces/IWallet'
import * as ethers from 'ethers'
import { SigningKey } from 'ethers/utils'
import { Address } from '../../types'

export class EthWallet implements IWallet {
  ethersWallet: ethers.Wallet
  signingKey: SigningKey
  constructor(ethersWallet: ethers.Wallet) {
    this.ethersWallet = ethersWallet
    this.signingKey = new SigningKey(this.ethersWallet.privateKey)
  }
  getEthersWallet(): ethers.Wallet {
    return this.ethersWallet
  }
  getAddress(): Address {
    return this.signingKey.address
  }
  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  signMessage(message: string): string {
    return ethers.utils.joinSignature(
      this.signingKey.signDigest(ethers.utils.arrayify(message))
    )
  }
}
