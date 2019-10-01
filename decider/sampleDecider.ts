import { Bytes, IDecision } from '../types'
import { IDecider } from './IDecider'

export class SampleDecider implements IDecider {
  public async decide(inputs: Bytes[]): Promise<IDecision> {
    return {
      outcome: true
    }
  }
}
