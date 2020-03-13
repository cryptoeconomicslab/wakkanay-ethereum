import { ethers } from 'ethers'
import initialize from '../src/index'
import { Bytes } from '@cryptoeconomicslab/primitives'
import deciderConfig from './config.local'
import { LevelKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import {
  AdjudicationContract,
  CommitmentContract,
  OwnershipPayoutContract
} from '@cryptoeconomicslab/eth-contract'
import { setupContext } from '@cryptoeconomicslab/context'
import JsonCoder from '@cryptoeconomicslab/coder'
setupContext({ coder: JsonCoder })

describe('index', () => {
  beforeEach(async () => {})
  describe('initialize', () => {
    test('suceed to initialize', async () => {
      const kvs = new LevelKeyValueStore(Bytes.fromString('root'))
      let wallet = ethers.Wallet.createRandom()
      wallet = wallet.connect(ethers.getDefaultProvider())
      const client = await initialize({ wallet, kvs, config: deciderConfig })
      expect(client['adjudicationContract']).toBeInstanceOf(
        AdjudicationContract
      )
      expect(client['commitmentContract']).toBeInstanceOf(CommitmentContract)
      expect(client['ownershipPayoutContract']).toBeInstanceOf(
        OwnershipPayoutContract
      )
    })
  })
})
