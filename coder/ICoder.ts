import IEncodable from '../types/Encodables'

/**
 * Coder interface
 * L1 specific ABI encoder/decoder must implement this interface.
 * for example, Coder for ethereum can be implemented using web3.js or ethers.js
 */
export interface ICoder {
  encodeParameter(input: IEncodable): string
  decode(types: Array<string | object>, data: string): IEncodable
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

  encode(input: IEncodable): string {
    return input.encode(this.coder)
  }

  decode(types: Array<string | object>, data: string): IEncodable {
    return this.coder.decode(types, data)
  }
}
