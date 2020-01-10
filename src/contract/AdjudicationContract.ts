import * as ethers from 'ethers'
import { contract, db, ovm, types } from 'wakkanay'
import EventLog from 'wakkanay/dist/events/types/EventLog'
import EthEventWatcher from '../events'
import KeyValueStore = db.KeyValueStore
import Property = ovm.Property
import ChallengeGame = ovm.ChallengeGame
import Address = types.Address
import BigNumber = types.BigNumber
import Bytes = types.Bytes
import List = types.List

export class AdjudicationContract implements contract.IAdjudicationContract {
  private connection: ethers.Contract
  private eventWatcher: EthEventWatcher
  readonly gasLimit: number
  public static abi = [
    'event AtomicPropositionDecided(bytes32 gameId, bool decision)',
    'event NewPropertyClaimed(uint256 gameId, tuple(address, bytes[]) property, uint256 createdBlock)',
    'event GameChallenged(bytes32 gameId, bytes32 challengeGameId)',
    'event GameDecided(bytes32 gameId, bool decision)',
    'event ChallengeRemoved(bytes32 gameId, bytes32 challengeGameId)',
    'function getGame(bytes32 gameId) view returns(tuple(tuple(address, bytes[]), bytes[], bool, uint256))',
    'function isDecided(bytes32 gameId) view returns(bool)',
    'function claimProperty(tuple(address, bytes[]))',
    'function decideClaimToTrue(bytes32 gameId)',
    'function decideClaimToFalse(bytes32 gameId, bytes32 challengingGameId)',
    'function removeChallenge(bytes32 gameId, bytes32 challengingGameId)',
    'function setPredicateDecision(bytes32 gameId, bool decision)',
    'function challenge(bytes32 gameId, bytes[] challengeInputs, bytes32 challengingGameId)'
  ]
  constructor(address: Address, eventDb: KeyValueStore, signer: ethers.Signer) {
    this.connection = new ethers.Contract(
      address.data,
      AdjudicationContract.abi,
      signer
    )
    this.eventWatcher = new EthEventWatcher({
      provider: this.connection.provider,
      kvs: eventDb,
      contractAddress: address.data,
      contractInterface: this.connection.interface
    })
    this.gasLimit = 200000
  }

  async getGame(gameId: Bytes): Promise<ChallengeGame> {
    const challengeGame = await this.connection.getGame(gameId.toHexString())
    return new ChallengeGame(
      this.getProperty(challengeGame[0]),
      challengeGame[1].map((challenge: string) =>
        Bytes.fromHexString(challenge)
      ),
      challengeGame[2],
      BigNumber.from(challengeGame[2].toString())
    )
  }

  async isDecided(gameId: Bytes): Promise<boolean> {
    return await this.connection.isDecided(gameId.toHexString())
  }

  async claimProperty(property: Property): Promise<void> {
    return await this.connection.claimProperty(
      { predicateAddress: property.deciderAddress, inputs: property.inputs },
      {
        gasLimit: this.gasLimit
      }
    )
  }

  async decideClaimToTrue(gameId: Bytes): Promise<void> {
    return await this.connection.decideClaimToTrue(gameId.toHexString(), {
      gasLimit: this.gasLimit
    })
  }

  async decideClaimToFalse(
    gameId: Bytes,
    challengingGameId: Bytes
  ): Promise<void> {
    return await this.connection.decideClaimToTrue(
      gameId.toHexString(),
      challengingGameId.toHexString(),
      {
        gasLimit: this.gasLimit
      }
    )
  }

  async removeChallenge(
    gameId: Bytes,
    challengingGameId: Bytes
  ): Promise<void> {
    return await this.connection.removeChallenge(
      gameId.toHexString(),
      challengingGameId.toHexString(),
      {
        gasLimit: this.gasLimit
      }
    )
  }

  async setPredicateDecision(gameId: Bytes, decision: boolean): Promise<void> {
    return await this.connection.removeChallenge(
      gameId.toHexString(),
      decision,
      {
        gasLimit: this.gasLimit
      }
    )
  }

  async challenge(
    gameId: Bytes,
    challengeInputs: List<Bytes>,
    challengingGameId: Bytes
  ): Promise<void> {
    return await this.connection.removeChallenge(
      gameId.toHexString(),
      challengeInputs.data.map(challengeInput => challengeInput.toHexString()),
      challengingGameId.toHexString(),
      {
        gasLimit: this.gasLimit
      }
    )
  }

  subscribeAtomicPropositionDecided(
    handler: (gameId: Bytes, decision: boolean) => void
  ): void {
    this.eventWatcher.subscribe('AtomicPropositionDecided', (log: EventLog) => {
      const [gameId, decision] = log.values
      handler(Bytes.fromHexString(gameId), decision)
    })
  }

  subscribeNewPropertyClaimed(
    handler: (
      gameId: Bytes,
      property: Property,
      createdBlock: BigNumber
    ) => void
  ): void {
    this.eventWatcher.subscribe('NewPropertyClaimed', (log: EventLog) => {
      const [gameId, property, createdBlock] = log.values
      handler(
        Bytes.fromHexString(gameId),
        this.getProperty(property),
        BigNumber.fromString(createdBlock.toString())
      )
    })
  }

  subscribeClaimChallenged(
    handler: (gameId: Bytes, challengeGameId: Bytes) => void
  ): void {
    this.eventWatcher.subscribe('ClaimChallenged', (log: EventLog) => {
      const [gameId, challengeGameId] = log.values
      handler(Bytes.fromHexString(gameId), Bytes.fromHexString(challengeGameId))
    })
  }

  subscribeClaimDecided(
    handler: (gameId: Bytes, decision: boolean) => void
  ): void {
    this.eventWatcher.subscribe('ClaimDecided', (log: EventLog) => {
      const [gameId, decision] = log.values
      handler(Bytes.fromHexString(gameId), decision)
    })
  }

  subscribeChallengeRemoved(
    handler: (gameId: Bytes, challengeGameId: Bytes) => void
  ): void {
    this.eventWatcher.subscribe('ChallengeRemoved', (log: EventLog) => {
      const [gameId, challengeGameId] = log.values
      handler(Bytes.fromHexString(gameId), Bytes.fromHexString(challengeGameId))
    })
  }

  private getProperty(property: any): Property {
    return new Property(
      Address.from(property[0]),
      property[1].map((i: string) => Bytes.fromHexString(i))
    )
  }
}
