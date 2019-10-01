import { Bytes, IDecision } from '../types'

export interface IDecider {
  decide(inputs: Bytes[]): Promise<IDecision>
}
