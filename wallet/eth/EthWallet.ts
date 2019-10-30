import { IWallet } from '../interfaces/IWallet'
import * as ethers from 'ethers'
import { arrayify, joinSignature, SigningKey } from 'ethers/utils'
import { Address } from '../../types'

export class EthWallet implements IWallet {
  private ethersWallet: ethers.Wallet
  private signingKey: SigningKey
  constructor(ethersWallet: ethers.Wallet) {
    this.ethersWallet = ethersWallet
    this.signingKey = new SigningKey(this.ethersWallet.privateKey)
  }
  public getEthersWallet(): ethers.Wallet {
    return this.ethersWallet
  }
  public getAddress(): Address {
    return this.signingKey.address
  }
  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  public signMessage(message: string): string {
    return joinSignature(this.signingKey.signDigest(arrayify(message)))
  }
}
