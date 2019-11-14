import Coder from '../../coder'
import { Bytes, Integer } from '../../types/Codables'
import EventLog from './EventLog'

export default class BlockSubmitted {
  constructor(readonly blockNumber: number, readonly root: Bytes) {}

  static fromRaw(event: EventLog): BlockSubmitted {
    const blockNumber = Coder.decode(Integer.default(), event.values[0])
    const root = Coder.decode(Bytes.default(), event.values[1])

    return new BlockSubmitted(blockNumber.data, root)
  }
}
