import { AbiCoder } from 'web3-eth-abi'
import { ICoder } from './ICoder'
import IEncodable, {
  Address,
  Bytes,
  Integer,
  List,
  Tuple,
  Struct
} from '../types/Encodables'

// Get Ethereum type representation of IEncodables.
function getEthTypeStringRep(v: IEncodable): string {
  if (v instanceof Integer) {
    return 'u256'
  } else if (v instanceof Bytes) {
    return 'bytes'
  } else if (v instanceof List) {
    return `${getEthTypeStringRep(v.v[0])}[]`
  } else if (v instanceof Tuple) {
    return `(${v.v.map(i => getEthTypeStringRep(i)).join(',')})`
  } else if (v instanceof Address) {
    return 'address'
  } else if (v instanceof Struct) {
    return 'struct' // TODO: use object representation
  }
  throw new Error(`Invalid type for Ethereum Abi coder: ${v.toString()}`)
}

// Ethereum ABI coder wrapper implement ICoder interface.
export default class EthCoder implements ICoder {
  private abiCoder: AbiCoder

  constructor() {
    this.abiCoder = new AbiCoder()
  }

  encodeParameter(input: IEncodable): string {
    return this.abiCoder.encodeParameter(
      getEthTypeStringRep(input),
      input.raw()
    )
  }

  encodeParameters(input: Array<IEncodable>): string {
    // TODO: implement
    return ''
  }

  decode(types: Array<string | object>, data: string): IEncodable {
    // TODO: fix
    return this.abiCoder.decodeParameters(types, data) as IEncodable
  }
}
