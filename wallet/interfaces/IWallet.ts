import { Address, Bytes } from '../../types/Codables'
import { IDepositContract } from '../../contract'

export interface IWallet {
  getAddress(): Address
  /**
   * Recovers address from message and signature
   * @param message
   * @param signature
   */
  recoverAddress(message: Bytes, signature: Bytes): Address
  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  signMessage(message: Bytes): Bytes
  /**
   * Gets deposit contract interface
   * @param address
   */
  getDepositContract(address: Address): IDepositContract
}
