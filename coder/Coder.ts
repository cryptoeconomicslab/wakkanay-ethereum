import { Codable } from '../types/Codables'

/**
 * Coder type
 * L1 specific ABI encoder/decoder must implement this interface.
 * for example, Coder for ethereum can be implemented using web3.js or ethers.js
 */
export type Coder = {
  encode(input: Codable): string
  decode<T extends Codable>(d: T, data: string): T
}
