import * as ethers from 'ethers'
import { IOwnershipPayoutContract } from '@cryptoeconomicslab/contract'
import { Address, BigNumber } from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'

export class OwnershipPayoutContract implements IOwnershipPayoutContract {
  public static abi = [
    'function finalizeExit(address depositContractAddress,tuple(address, bytes[]) _exitProperty, uint256 _depositedRangeId, address _owner)'
  ]

  private connection: ethers.Contract

  constructor(readonly address: Address, signer: ethers.Signer) {
    this.connection = new ethers.Contract(
      address.data,
      OwnershipPayoutContract.abi,
      signer
    )
  }

  public async finalizeExit(
    depositContractAddress: Address,
    exitProperty: Property,
    depositedRangeId: BigNumber,
    owner: Address
  ): Promise<void> {
    await this.connection.finalizeExit(
      depositContractAddress.data,
      [exitProperty.deciderAddress.data, exitProperty.inputs],
      depositedRangeId.data,
      owner.data
    )
  }
}
