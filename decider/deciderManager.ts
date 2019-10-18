import { Address } from '../types'
import { Decider } from './Decider'

export class DeciderManager {
  private deciders: Map<Address, Decider>
  constructor() {
    this.deciders = new Map<Address, Decider>()
  }
  public setDecider(address: Address, decier: Decider) {
    this.deciders.set(address, decier)
  }
  public getDecider(address: Address) {
    this.deciders.get(address)
  }
}
