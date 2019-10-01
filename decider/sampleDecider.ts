import { Bytes, Decision } from '../types/types'
import { DeciderInterface } from './deciderInterface'

export class SampleDecider implements DeciderInterface {
  public async decide(inputs: Bytes[]): Promise<Decision> {
    return {
      outcome: true
    }
  }
}
