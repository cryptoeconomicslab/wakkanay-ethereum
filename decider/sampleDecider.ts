import { Bytes, Decision } from '../types'
import { Decider } from './Decider'

export class SampleDecider implements Decider {
  public async decide(inputs: Bytes[]): Promise<Decision> {
    return {
      outcome: true
    }
  }
}
