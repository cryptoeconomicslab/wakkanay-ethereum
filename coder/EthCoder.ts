import { AbiCoder, ParamType, arrayify } from 'ethers/utils'
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
import { AbiDecodeError } from './Error'

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
  } else if (
    v instanceof List &&
    (v.data[0] instanceof Tuple || v.data[0] instanceof Struct)
  ) {
    return {
      type: 'tuple[]',
      components: getEthParamType(v.data[0]).components
    }
  }

  return { type: getEthTypeStringRep(v) }
}

export function decodeInner(d: Codable, input: any): Codable {
  if (d instanceof Integer) {
    d.setData(input.toNumber())
  } else if (d instanceof Address) {
    d.setData(input)
  } else if (d instanceof Bytes) {
    d.setData(arrayify(input))
  } else if (d instanceof List) {
    d.setData(
      input.map((i: any) => {
        const di = d.getC().default()
        decodeInner(di, i)
        return di
      })
    )
  } else if (d instanceof Tuple) {
    d.setData(d.data.map((d, i) => decodeInner(d, input[i])))
  } else if (d instanceof Struct) {
    const data: { [key: string]: Codable } = {}
    Object.keys(d.data)
      .sort()
      .forEach((k, i) => {
        data[k] = decodeInner(d.data[k], input[i])
      })
    d.setData(data)
  } else {
    throw AbiDecodeError.from(d)
  }
  return d
}

// Ethereum ABI coder
const abiCoder = new AbiCoder()
const EthCoder: Coder = {
  encode(input: Codable): string {
    return abiCoder.encode([getEthParamType(input)], [input.raw])
  },
  decode<T extends Codable>(d: T, data: string): T {
    const t = getEthParamType(d)
    const res = abiCoder.decode([t], data) as Array<any>
    return decodeInner(d, res[0]) as T
  }
}

export default EthCoder
