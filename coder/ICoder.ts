import { Codable } from '../types/Codables'

/**
 * Coder interface
 * L1 specific ABI encoder/decoder must implement this interface.
 * for example, Coder for ethereum can be implemented using web3.js or ethers.js
 */
export interface ICoder {
  encodeParameter(input: Codable): string
  decode(types: Array<string | object>, data: string): Codable
}

/* interface for encoder/decoder
 * regardless of encoding format, it can encode and decode
 * any types in types/Codables.
 * encode(Codable)
 * decode(Bytes)
 */
export default class Coder {
  private coder: ICoder

  constructor(coder: ICoder) {
    this.coder = coder
  }

  encode(input: Codable): string {
    return input.encode(this.coder)
  }

  decode(types: Array<string | object>, data: string): Codable {
    return this.coder.decode(types, data)
  }
}
