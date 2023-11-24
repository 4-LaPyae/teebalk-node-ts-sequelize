export enum ContractNameEnum {
  REWARD_TOKEN = 'REWARD_TOKEN',
  COIN_TOKEN = 'COIN_TOKEN'
}

export enum BlockchainTxStatusEnum {
  PENDING = 'PENDING', // transaction already is processing in blockchain
  FAILED = 'FAILED', // somethind went wrong
  SUCCEED = 'SUCCEED', // complete transaction
  ONHOLD = 'ONHOLD', // just hold funds
  DISCARDED = 'DISCARDED', // rejected by SPIN or VIBES
  SCHEDULED = 'SCHEDULED' // waits in queue
}

export enum ChargeTxStatusEnum {
  PENDING = 'PENDING',
  ENABLED = 'ENABLED',
  USEDUP = 'USEDUP',
  EXPIRED = 'EXPIRED',
  DEDUCTED = 'DEDUCTED',
  DISCARDED = 'DISCARDED'
}
