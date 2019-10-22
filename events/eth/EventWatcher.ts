import * as ethers from 'ethers'
import { EventDb } from '../EventDb'
import { KeyValueStore } from '../../db'
import {
  IEventWatcher,
  EventHandler,
  ErrorHandler,
  CompletedHandler
} from '../interfaces/IEventWatcher'
type JsonRpcProvider = ethers.providers.JsonRpcProvider

export interface EventWatcherOptions {
  interval: number
}

export class EventWatcher implements IEventWatcher {
  public httpProvider: JsonRpcProvider
  public eventDb: EventDb
  public checkingEvents: Map<string, EventHandler>
  public options: EventWatcherOptions
  public timer?: NodeJS.Timer
  public contractAddress: string
  public contractInterface: ethers.utils.Interface

  constructor(
    endpoint: string,
    kvs: KeyValueStore,
    contractAddress: string,
    contractInterface: ethers.utils.Interface,
    options: EventWatcherOptions
  ) {
    this.httpProvider = new ethers.providers.JsonRpcProvider(endpoint)
    this.eventDb = new EventDb(kvs)
    this.checkingEvents = new Map<string, EventHandler>()
    this.options = {
      interval: 1000,
      ...options
    }
    this.contractAddress = contractAddress
    this.contractInterface = contractInterface
  }

  public addEvent(event: string, handler: EventHandler) {
    this.checkingEvents.set(event, handler)
  }

  public async initPolling(
    handler: CompletedHandler,
    errorHandler?: ErrorHandler
  ) {
    try {
      const block = await this.httpProvider.getBlock('latest')
      const loaded = await this.eventDb.getLastLoggedBlock(this.contractAddress)
      await this.polling(loaded, block.number, handler)
    } catch (e) {
      console.log(e)
      if (errorHandler) {
        errorHandler(e)
      }
    }
    this.timer = setTimeout(async () => {
      await this.initPolling(handler, errorHandler)
    }, this.options.interval)
  }

  public cancel() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  public async polling(
    fromBlockNumber: number,
    blockNumber: number,
    completedHandler: CompletedHandler
  ) {
    const events = await this.httpProvider.getLogs({
      address: this.contractAddress,
      fromBlock: fromBlockNumber,
      toBlock: blockNumber
    })

    const filtered = events
      .filter(async e => {
        if (e.transactionHash) {
          const seen = await this.eventDb.getSeen(e.transactionHash)
          return !seen
        } else {
          return false
        }
      })
      .map(e => {
        const logDesc = this.contractInterface.parseLog(e)
        const handler = this.checkingEvents.get(logDesc.name)
        if (handler) {
          handler(logDesc)
        }
        if (e.transactionHash) {
          this.eventDb.addSeen(e.transactionHash)
        }
        return true
      })
    await this.eventDb.setLastLoggedBlock(this.contractAddress, blockNumber)
    if (filtered.length > 0) {
      completedHandler()
    }
  }
}
