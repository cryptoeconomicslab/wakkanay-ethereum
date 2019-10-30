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
export function getEthTypeStringRep(v: Codable): string {
  if (v instanceof Integer) {
    return 'uint256'
  } else if (v instanceof Bytes) {
    return 'bytes'
  } else if (v instanceof List) {
    return `${getEthTypeStringRep(v.data[0])}[]`
  } else if (v instanceof Tuple) {
    return 'tuple'
  } else if (v instanceof Address) {
    return 'address'
  } else if (v instanceof Struct) {
    return 'tuple'
  }
  throw new Error(`Invalid type for Ethereum Abi coder: ${v.toString()}`)
}

function asParamComponent(v: Codable, i: number, key?: string): ParamType {
  const type = {
    type: getEthTypeStringRep(v),
    name: key || i.toString()
  }
  if (v instanceof Tuple) {
    return {
      ...type,
      components: v.data.map((v, i) => asParamComponent(v, i))
    }
  } else if (v instanceof Struct) {
    return {
      ...type,
      components: Object.keys(v.data)
        .sort()
        .map((k, i) => asParamComponent(v.data[k], i, k))
    }
  }

  return type
}

// Get Ethreum ParamType representation of Codables
export function getEthParamType(v: Codable): ParamType {
  if (v instanceof Tuple) {
    return {
      type: 'tuple',
      components: v.data.map((v, i) => asParamComponent(v, i))
    }
  } else if (v instanceof Struct) {
    return {
      type: 'tuple',
      components: Object.keys(v.data)
        .sort()
        .map((k, i) => asParamComponent(v.data[k], i, k))
    }
  }

  return { type: getEthTypeStringRep(v) }
}

// Ethereum ABI coder wrapper implement Coder interface.
const abiCoder = new AbiCoder()
const EthCoder: Coder = {
  encode(input: Codable): string {
    return abiCoder.encode([getEthParamType(input)], [input.raw()])
  },
  // todo: have to type coercion based on given types array
  decode(types: Array<string | ParamType>, data: string): Codable {
    return abiCoder.decode(types, data)
  }
}

export default EthCoder
