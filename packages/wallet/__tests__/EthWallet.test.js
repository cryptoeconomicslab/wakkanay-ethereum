jest.unmock('ethers')
const { EthWallet } = require('../src/EthWallet')
const ethers = require('ethers')
const { Address, Bytes } = require('@cryptoeconomicslab/primitives')
const { InMemoryKeyValueStore } = require('@cryptoeconomicslab/level-kvs')

const mockWallet = jest.fn().mockImplementation(privateKey => {
  return {
    address: new ethers.utils.SigningKey(privateKey).address,
    getBalance: jest.fn().mockImplementation(async () => {
      return '100'
    }),
    privateKey: privateKey
  }
})
const mockContract = jest.fn().mockImplementation(() => {
  return {
    connect: jest.fn().mockImplementation(() => {
      return {
        balanceOf: jest.fn().mockImplementation(async () => {
          return '100'
        }),
        decimals: jest.fn().mockImplementation(async () => {
          return 8
        }),
        symbol: jest.fn().mockImplementation(async () => {
          return 'DAI'
        })
      }
    })
  }
})
ethers.Wallet = mockWallet
ethers.Contract = mockContract

describe('EthWallet', () => {
  let wallet
  beforeEach(async () => {
    mockContract.mockClear()
    mockWallet.mockClear()
    wallet = new EthWallet(
      new ethers.Wallet(
        '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
      ),
      new InMemoryKeyValueStore(Bytes.fromString('test'))
    )
  })
  describe('signMessage', () => {
    it('succeed to sign hex string', async () => {
      const message = Bytes.fromHexString('0x00123456')
      const signature = await wallet.signMessage(message)
      expect(signature).toBeTruthy()
    })
  })
  describe('verifyMySignature', () => {
    it('succeed to verify signature', async () => {
      const message = Bytes.fromHexString('0x00123456')
      const signatureDigest = await wallet.signMessage(message)
      const verify = await wallet.verifyMySignature(message, signatureDigest)
      expect(verify).toBeTruthy()
    })
    it('fail to verify signature', async () => {
      const bobWallet = new EthWallet(
        new ethers.Wallet(
          '0x17d08f5fe8c77af811caa0c9a187e668ce3b74a99acc3f6d976f075fa8e0be55'
        )
      )
      const message = Bytes.fromHexString('0x00123456')
      const bobSignatureDigest = await bobWallet.signMessage(message)
      const verify = await wallet.verifyMySignature(
        message,
        bobSignatureDigest,
        Bytes.default()
      )
      expect(verify).toBeFalsy()
    })
  })
  describe('getL1Balance', () => {
    it('succeed to get L1 balance', async () => {
      const balance = await wallet.getL1Balance()
      expect(balance).toBeTruthy()
      expect(balance.decimals).toBe(9)
      expect(balance.symbol).toBe('gwei')
    })
    it('succeed to get L1(ERC20) balance', async () => {
      const tokenAddress = Address.from(
        '0xd0a1e359811322d97991e03f863a0c30c2cf029c'
      )
      const balance = await wallet.getL1Balance(tokenAddress)
      expect(balance).toBeTruthy()
      expect(balance.decimals).toBe(8)
      expect(balance.symbol).toBe('DAI')
    })
  })
})
