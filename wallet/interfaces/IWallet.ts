import { Address } from '../../types'

export interface IWallet {
  getAddress(): Address
  /**
   * signMessage signed a hex string message
   * @param message is hex string
   */
  signMessage(message: string): string
}
