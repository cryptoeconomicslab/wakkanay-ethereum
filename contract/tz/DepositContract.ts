import { IDepositContract } from '../interfaces/IDepositContract'
import { Integer } from '../../../src/types/Codables'
import { Property } from '../../ovm/types'

/**
 * TODO: add implementation
 */
export class DepositContract implements IDepositContract {
  async deposit(amount: Integer, initialState: Property): Promise<void> {
    throw new Error('Not implemented')
  }
  async finalizeCheckpoint(checkpoint: Property): Promise<void> {
    throw new Error('Not implemented')
  }
  async finalizeExit(exit: Property, depositedRangeId: Integer): Promise<void> {
    throw new Error('Not implemented')
  }
}
