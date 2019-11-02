import { KeyValueStore } from '../db/KeyValueStore'
import { Bytes } from '../types/Codables'

export class EventDb {
  kvs: KeyValueStore

  constructor(kvs: KeyValueStore) {
    this.kvs = kvs.bucket(Bytes.fromString('event_db'))
  }

  public async getLastLoggedBlock(topic: Bytes): Promise<number> {
    const result = await this.kvs.get(topic)
    return result === null ? 0 : parseInt(result.intoString())
  }

  public async setLastLoggedBlock(topic: Bytes, loaded: number): Promise<void> {
    await this.kvs.put(topic, Bytes.fromString(loaded.toString()))
  }

  public async addSeen(event: Bytes): Promise<void> {
    await this.kvs.put(event, Bytes.fromString('true'))
  }

  public async getSeen(event: Bytes): Promise<boolean> {
    const result = await this.kvs.get(event)
    return result !== null
  }
}
