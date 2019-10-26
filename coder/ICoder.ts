import IEncodable, {
  Address,
  Bytes,
  Integer,
  List,
  Tuple
} from '../types/Encodables'

export interface ICoder {
  encodeInteger(i: Integer): string
  encodeBytes(b: Bytes): string
  encodeAddress(b: Address): string
  encodeList<E extends IEncodable>(l: List<E>): string
  encodeTuple(t: Tuple): string

  decode(input: Bytes): IEncodable
}

// interface for encoder/decoder
// regardless of encoding format, it can encode and decode
// any types in types/Codables.
// encode(Codable)
// decode(Bytes)
export default class Coder {
  private coder: ICoder

  constructor(coder: ICoder) {
    this.coder = coder
  }

  encode(input: IEncodable): string {
    return input.encode(this.coder)
  }

  decode(input: Bytes): IEncodable {
    return this.coder.decode(input)
  }
}
