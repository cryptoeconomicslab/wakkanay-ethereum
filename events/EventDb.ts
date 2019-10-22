import { KeyValueStore } from '../db/KeyValueStore'
import { Bytes } from '../types'

export class EventDb {
  kvs: KeyValueStore

  constructor(kvs: KeyValueStore) {
    this.kvs = kvs.bucket('event_db')
  }

  public async getLastLoggedBlock(topic: Bytes): Promise<number> {
    const result = await this.kvs.get(topic)
    return result === null ? 0 : parseInt(result)
  }

  public async setLastLoggedBlock(topic: Bytes, loaded: number): Promise<void> {
    await this.kvs.put(topic, loaded.toString())
  }

  public async addSeen(event: Bytes): Promise<void> {
    await this.kvs.put(event, 'true')
  }

  public async getSeen(event: Bytes): Promise<boolean> {
    const result = await this.kvs.get(event)
    return result !== null
  }
}
