import * as ethers from 'ethers'
import {
  BigNumber,
  Integer,
  Address,
  Bytes,
  Range
} from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'
import { KeyValueStore } from '@cryptoeconomicslab/db'
import { IDepositContract, EventLog } from '@cryptoeconomicslab/contract'
import EthEventWatcher from '../events'

export class DepositContract implements IDepositContract {
  private eventWatcher: EthEventWatcher
  private connection: ethers.Contract
  readonly gasLimit: number

  public static abi = [
    'event CheckpointFinalized(bytes32 checkpointId, tuple(tuple(uint256, uint256), tuple(address, bytes[])) checkpoint)',
    'event ExitFinalized(bytes32 exitId)',
    'event DepositedRangeExtended(tuple(uint256, uint256) newRange)',
    'event DepositedRangeRemoved(tuple(uint256, uint256) removedRange)',
    'function deposit(uint256 _amount, tuple(address, bytes[]) _initialState)',
    'function finalizeCheckpoint(tuple(address, bytes[]) _checkpoint)',
    'function finalizeExit(tuple(address, bytes[]) _exit, uint256 _depositedRangeId)'
  ]
  constructor(
    readonly address: Address,
    eventDb: KeyValueStore,
    signer: ethers.Signer
  ) {
    this.connection = new ethers.Contract(
      address.data,
      DepositContract.abi,
      signer
    )
    this.gasLimit = 200000
    this.eventWatcher = new EthEventWatcher({
      provider: this.connection.provider,
      kvs: eventDb,
      contractAddress: address.data,
      contractInterface: this.connection.interface
    })
  }
  async deposit(amount: Integer, initialState: Property): Promise<void> {
    return await this.connection.deposit(
      amount.data,
      [initialState.deciderAddress.data, initialState.inputs],
      {
        gasLimit: this.gasLimit
      }
    )
  }
  async finalizeCheckpoint(checkpoint: Property): Promise<void> {
    return await this.connection.finalizeCheckpoint(
      [checkpoint.deciderAddress.data, checkpoint.inputs],
      {
        gasLimit: this.gasLimit
      }
    )
  }
  async finalizeExit(exit: Property, depositedRangeId: Integer): Promise<void> {
    return await this.connection.finalizeExit(
      [exit.deciderAddress.data, exit.inputs],
      depositedRangeId.data,
      {
        gasLimit: this.gasLimit
      }
    )
  }

  subscribeCheckpointFinalized(
    handler: (checkpointId: Bytes, checkpoint: [Range, Property]) => void
  ) {
    this.eventWatcher.subscribe('CheckpointFinalized', (log: EventLog) => {
      const checkpointId = log.values[0]
      const checkpoint = log.values[1]
      const stateUpdate = new Property(
        Address.from(checkpoint[1][0]),
        checkpoint[1][1].map(Bytes.fromHexString)
      )
      const subrange = new Range(
        BigNumber.fromString(checkpoint[0][0].toString()),
        BigNumber.fromString(checkpoint[0][1].toString())
      )

      handler(Bytes.fromHexString(checkpointId), [subrange, stateUpdate])
    })
    this.eventWatcher.cancel()
    this.eventWatcher.start(() => {
      // do nothing
    })
  }

  subscribeExitFinalized(handler: (exitId: Bytes) => void) {
    this.eventWatcher.subscribe('ExitFinalized', (log: EventLog) => {
      const [exitId] = log.values
      handler(Bytes.fromHexString(exitId))
    })
    this.eventWatcher.cancel()
    this.eventWatcher.start(() => {
      // do nothing
    })
  }

  subscribeDepositedRangeExtended(handler: (range: Range) => void) {
    this.eventWatcher.subscribe('DepositedRangeExtended', (log: EventLog) => {
      const rawRange = log.values.newRange
      const start = BigNumber.fromHexString(rawRange[0].toHexString())
      const end = BigNumber.fromHexString(rawRange[1].toHexString())
      handler(new Range(start, end))
    })
    this.eventWatcher.cancel()
    this.eventWatcher.start(() => {
      // do nothing
    })
  }

  subscribeDepositedRangeRemoved(handler: (range: Range) => void) {
    this.eventWatcher.subscribe('DepositedRangeRemoved', (log: EventLog) => {
      const rawRange = log.values.removedRange
      const start = BigNumber.fromHexString(rawRange[0].toHexString())
      const end = BigNumber.fromHexString(rawRange[1].toHexString())
      handler(new Range(start, end))
    })
    this.eventWatcher.cancel()
    this.eventWatcher.start(() => {
      // do nothing
    })
  }
}
