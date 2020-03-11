import * as ethers from 'ethers'
import { EthWallet } from '@cryptoeconomicslab/eth-wallet'
import { Address, Bytes } from '@cryptoeconomicslab/primitives'
import { KeyValueStore } from '@cryptoeconomicslab/db'
import {
  DepositContract,
  ERC20Contract,
  CommitmentContract,
  AdjudicationContract,
  OwnershipPayoutContract,
  PETHContract
} from '@cryptoeconomicslab/eth-contract'
import LightClient from '@cryptoeconomicslab/plasma-light-client'

interface EthLightClientOptions {
  wallet: ethers.Wallet
  kvs: KeyValueStore
  deciderConfig: any
  aggregatorEndpoint?: string
}

export default async function initialize(options: EthLightClientOptions) {
  const eventDb = await options.kvs.bucket(Bytes.fromString('event'))
  const ethWallet = new EthWallet(options.wallet)
  const adjudicationContract = new AdjudicationContract(
    Address.from(options.deciderConfig.adjudicationContract),
    eventDb,
    options.wallet
  )
  function depositContractFactory(address: Address) {
    return new DepositContract(address, eventDb, options.wallet)
  }
  function tokenContractFactory(address: Address) {
    return new ERC20Contract(address, options.wallet)
  }
  const commitmentContract = new CommitmentContract(
    Address.from(options.deciderConfig.commitmentContract),
    eventDb,
    options.wallet
  )
  const ownershipPayoutContract = new OwnershipPayoutContract(
    Address.from(options.deciderConfig.payoutContracts['OwnershipPayout']),
    options.wallet
  )
  const client = await LightClient.initilize({
    wallet: ethWallet,
    witnessDb: options.kvs,
    adjudicationContract,
    depositContractFactory,
    tokenContractFactory,
    commitmentContract,
    ownershipPayoutContract,
    deciderConfig: options.deciderConfig,
    aggregatorEndpoint: options.aggregatorEndpoint
  })
  client.registerCustomToken(
    new PETHContract(
      Address.from(options.deciderConfig.PlasmaETH),
      options.wallet
    ),
    depositContractFactory(
      Address.from(options.deciderConfig.payoutContracts['DepositContract'])
    )
  )
  return client
}
