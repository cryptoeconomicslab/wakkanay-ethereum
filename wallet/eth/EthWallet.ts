import { IWallet } from '../interfaces/IWallet'
import * as ethers from 'ethers'
import { arrayify, joinSignature, SigningKey } from 'ethers/utils'
import { Address, Bytes } from '../../types/Codables'

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
    return Address.from(this.signingKey.address)
  }
  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  public async signMessage(message: Bytes): Promise<Bytes> {
    return Bytes.fromHexString(
      joinSignature(this.signingKey.signDigest(arrayify(message.toHexString())))
    )
  }
  /**
   * verify signature
   * secp256k1 doesn't need a public key to verify the signature
   */
  public async verifySignature(message: Bytes, signature: Bytes): Promise<Boolean> {
    const recoveredAddress = this.recoverAddress(message, signature)
    return (recoveredAddress.raw.toLocaleLowerCase() === this.ethersWallet.address.toLocaleLowerCase())
  }
  /**
   * recoverAddress
   */
  private recoverAddress(message: Bytes, signatureBytes: Bytes): Address {
    const signature = ethers.utils.splitSignature(signatureBytes.toHexString())
    const recoverAddress = ethers.utils.recoverAddress(
      message.toHexString(),
      signature
    )
    return Address.from(recoverAddress)
  }
}
