import { Bytes } from '../../types/Codables'
import EventLog from './EventLog'

export default class BlockSubmitted {
  constructor(readonly blockNumber: number, readonly root: Bytes) {}

  static fromRaw(event: EventLog): BlockSubmitted {
    // TODO: write this thing.
    return new BlockSubmitted(0, Bytes.fromString('hello world'))
  }
}
