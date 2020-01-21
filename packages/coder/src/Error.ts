import { Codable } from '@cryptoeconomicslab/primitives'

export class AbiDecodeError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'AbiError'
  }

  static from(codable: Codable): AbiDecodeError {
    return new AbiDecodeError(`Cannot decode object: ${codable.toString()}`)
  }
}
