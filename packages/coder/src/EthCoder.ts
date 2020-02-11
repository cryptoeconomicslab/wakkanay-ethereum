import { AbiCoder, ParamType, arrayify } from 'ethers/utils'
import { Coder } from '@cryptoeconomicslab/coder'
import {
  Codable,
  Bytes,
  List,
  Tuple,
  Struct
} from '@cryptoeconomicslab/primitives'
import { AbiDecodeError } from './Error'
import JSBI from 'jsbi'

// Get Ethereum type representation of Codables.
export function getEthTypeStringRep(v: Codable): string {
  const c = v.constructor.name
  if (c === 'Integer' || c === 'BigNumber') {
    return 'uint256'
  } else if (c === 'Bytes') {
    return 'bytes'
  } else if (c === 'List') {
    const d = (v as List<Codable>).getC().default()
    return `${getEthTypeStringRep(d)}[]`
  } else if (c === 'Tuple') {
    return 'tuple'
  } else if (c === 'Address') {
    return 'address'
  } else if (c === 'Struct') {
    return 'tuple'
  }
  throw new Error(`Invalid type for Ethereum Abi coder: ${v.toString()}`)
}

// Ethereum type representation with components field.
function asParamComponent(v: Codable, i: number, key?: string): ParamType {
  const type = {
    ...getEthParamType(v),
    name: key || i.toString()
  }
  if (v.constructor.name === 'Tuple') {
    return {
      ...type,
      components: (v as Tuple).data.map((v, i) => asParamComponent(v, i))
    }
  } else if (v.constructor.name === 'Struct') {
    return {
      ...type,
      components: (v as Struct).data.map(({ key, value }) =>
        asParamComponent(value, i, key)
      )
    }
  }

  return type
}

// Get Ethreum ParamType representation of Codables
export function getEthParamType(v: Codable): ParamType {
  const c = v.constructor.name
  if (c === 'Tuple') {
    return {
      type: 'tuple',
      components: (v as Tuple).data.map((v, i) => asParamComponent(v, i))
    }
  } else if (c === 'Struct') {
    return {
      type: 'tuple',
      components: (v as Struct).data.map(({ key, value }, i) =>
        asParamComponent(value, i, key)
      )
    }
  } else if (c === 'List') {
    const d = (v as List<Codable>).getC().default()
    if (d.constructor.name === 'List') {
      return {
        ...getEthParamType(d),
        type: `${getEthTypeStringRep(d)}[]`
      }
    }
    if (d.constructor.name === 'Tuple' || d.constructor.name === 'Struct') {
      return {
        type: 'tuple[]',
        components: getEthParamType(d).components
      }
    }
  }

  return { type: getEthTypeStringRep(v) }
}

// decode inner representation.
// transform decoded object into certain Codable type
export function decodeInner(d: Codable, input: any): Codable {
  const c = d.constructor.name
  if (c === 'Integer') {
    d.setData(input.toNumber())
  } else if (c === 'BigNumber') {
    d.setData(JSBI.BigInt(input))
  } else if (c === 'Address') {
    d.setData(input)
  } else if (c === 'Bytes') {
    d.setData(arrayify(input))
  } else if (c === 'List') {
    d.setData(
      input.map((i: any) => {
        const di = (d as List<Codable>).getC().default()
        decodeInner(di, i)
        return di
      })
    )
  } else if (c === 'Tuple') {
    d.setData((d as Tuple).data.map((d, i) => decodeInner(d, input[i])))
  } else if (c === 'Struct') {
    const data: Array<{ key: string; value: Codable }> = (d as Struct).data.map(
      ({ key, value }, i) => {
        return { key: key, value: decodeInner(value, input[i]) }
      }
    )
    d.setData(data)
  } else {
    throw AbiDecodeError.from(d)
  }
  return d
}

const abiCoder = new AbiCoder()
// Ethereum coder object
export const EthCoder: Coder = {
  /**
   * encode given codable object into EthereumABI hex string representation
   * @param input codable object to encode
   */
  encode(input: Codable): Bytes {
    const data = abiCoder.encode([getEthParamType(input)], [input.raw])
    return Bytes.fromHexString(data)
  },
  /**
   * decode given hex string into given codable object
   * @param d Codable object to represent into what type data is decoded
   * @param data hex string to decode
   */
  decode<T extends Codable>(d: T, data: Bytes): T {
    const t = getEthParamType(d)
    const res = abiCoder.decode([t], data.toHexString()) as Array<any>
    return decodeInner(d, res[0]) as T
  }
}

export default EthCoder
