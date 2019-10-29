import { AbiCoder, ParamType } from 'ethers/utils'
import { Coder } from './Coder'
import {
  Codable,
  Address,
  Bytes,
  Integer,
  List,
  Tuple,
  Struct
} from '../types/Codables'

// Get Ethereum type representation of Codables.
export function getEthTypeStringRep(v: Codable): string | ParamType {
  if (v instanceof Integer) {
    return 'u256'
  } else if (v instanceof Bytes) {
    return 'bytes'
  } else if (v instanceof List) {
    return `${getEthTypeStringRep(v.data[0])}[]`
  } else if (v instanceof Tuple) {
    return `(${v.data.map(i => getEthTypeStringRep(i)).join(',')})`
  } else if (v instanceof Address) {
    return 'address'
  } else if (v instanceof Struct) {
    return 'struct' // TODO: use ParamType
  }
  throw new Error(`Invalid type for Ethereum Abi coder: ${v.toString()}`)
}

// Ethereum ABI coder wrapper implement Coder interface.
const abiCoder = new AbiCoder()
const EthCoder: Coder = {
  encode(input: Codable): string {
    return abiCoder.encode([getEthTypeStringRep(input)], [input.raw()])
  },
  // todo: have to type coercion based on given types array
  decode(types: Array<string | ParamType>, data: string): Codable {
    return abiCoder.decode(types, data)
  }
}

export default EthCoder
