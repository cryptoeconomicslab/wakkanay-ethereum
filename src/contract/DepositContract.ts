import * as ethers from 'ethers'
import { Integer, Address, Bytes } from 'wakkanay/dist/types/Codables'
import { Property } from 'wakkanay/dist/ovm/types'
import { KeyValueStore } from 'wakkanay/dist/db'
import { contract } from 'wakkanay'
import IDepositContract = contract.IDepositContract
import EthEventWatcher from '../events'
import EventLog from 'wakkanay/dist/events/types/EventLog'
import EthCoder from '../coder/EthCoder'

export class DepositContract implements IDepositContract {
  private eventWatcher: EthEventWatcher
  private connection: ethers.Contract
  readonly gasLimit: number

  public static abi = [
    'function deposit(uint256 _amount, tuple(address, bytes[]) _initialState)',
    'function finalizeCheckpoint(tuple(address, bytes[]) _checkpoint)',
    'function finalizeExit(tuple(address, bytes[]) _exit, uint256 _depositedRangeId)'
  ]
  constructor(
    readonly address: Address,
    eventDb: KeyValueStore,
    provider: ethers.providers.Provider
  ) {
    this.connection = new ethers.Contract(
      address.raw,
      DepositContract.abi,
      provider
    )
    this.gasLimit = 200000
    this.eventWatcher = new EthEventWatcher({
      endpoint: process.env.MAIN_CHAIN_ENDPOINT as string,
      kvs: eventDb,
      contractAddress: address.raw,
      contractInterface: this.connection.interface
    })
  }
  async deposit(amount: Integer, initialState: Property): Promise<void> {
    return await this.connection.deposit(amount.data, initialState, {
      gasLimit: this.gasLimit
    })
  }
  async finalizeCheckpoint(checkpoint: Property): Promise<void> {
    return await this.connection.deposit(checkpoint, {
      gasLimit: this.gasLimit
    })
  }
  async finalizeExit(exit: Property, depositedRangeId: Integer): Promise<void> {
    return await this.connection.deposit(exit, depositedRangeId, {
      gasLimit: this.gasLimit
    })
  }

  subscribeCheckpointFinalized(
    handler: (
      checkpointId: Bytes,
      checkpoint: [[number, number], Property]
    ) => void
  ) {
    this.eventWatcher.subscribe('CheckpointFinalized', (log: EventLog) => {
      const [checkpointId, checkpoint] = log.values
      const stateUpdate = Property.fromStruct(
        EthCoder.decode(Property.getParamType(), checkpoint[1])
      )
      handler(Bytes.from(checkpointId), [checkpoint[0], stateUpdate])
    })
  }

  subscribeExitFinalized(handler: (exitId: Bytes) => void) {
    this.eventWatcher.subscribe('ExitFinalized', (log: EventLog) => {
      const [exitId] = log.values
      handler(Bytes.from(exitId))
    })
  }
}
