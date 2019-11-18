import { Address, Bytes } from '../../types/Codables'
import { Balance } from '../../types'
import { IDepositContract } from '../../contract'

export interface IWallet {
  getAddress(): Address
  getL1Balance(tokenAddress?: Address): Promise<Balance>

  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  signMessage(message: Bytes): Promise<Bytes>

  /**
   * Verify message and signature from publicKey
   * publicKey isn't needed depending on the cryptographic algorithm
   * @param message
   * @param signature
   * @param publicKey?
   */
  verifySignature(
    message: Bytes,
    signature: Bytes,
    publicKey?: Bytes
  ): Promise<Boolean>

  /**
   * Gets deposit contract interface for certain L1 platform
   * @param address
   */
  getDepositContract(address: Address): IDepositContract
}
