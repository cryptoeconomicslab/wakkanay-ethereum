import { Bytes, Decision } from '../types'

export interface Decider {
  decide(inputs: Bytes[]): Promise<Decision>
}
