import { SubstrateEvent } from '@subql/types'
import { getTokenName, nativeToken } from '../utils/tokens'
import { handleTransfer } from './handleTransfer'
import { handleDeposit } from './handleDeposit'
import { handleTreasuryDeposit } from './handleTreasuryDeposit'
import { handleReserved } from './handleReserved'
import { handleUnReserved } from './handleUnReserved'
import { handleReservedRepatriated } from './handleReserveRepatriated'
import { handleWithdrawn } from './handleWithdrawn'
import { handleBalanceUpdated } from './handleBalanceUpdated'
import { isNewAccount } from '../utils/isNewAccount'

/*
handle balances.Transfer
DONOT need handle balances.Endowed as balances.Endowed is appear with balances.Treansfer
*/
export async function handleBalancesTransfer(event: SubstrateEvent) {
    const [from, to, value] = event.event.data
    const fromId = from.toString()
    const toId = to.toString()
    const amount = BigInt(value.toString())
    const tokenName = await getTokenName(nativeToken)
    const blockNumber = event.block.block.header.number.toBigInt()
    const fromAccountIsNew = isNewAccount(fromId, event);
    const toAccountIsNew = isNewAccount(toId, event);

    await handleTransfer(tokenName, fromId, toId, amount, event.block.timestamp, blockNumber, fromAccountIsNew, toAccountIsNew)
}

/*
handle balances.Deposit
*/
export async function handleBalancesDeposit(event: SubstrateEvent) {
    const [to, value] = event.event.data
    const toId = to.toString()
    const amount = BigInt(value.toString())
    const tokenName = await getTokenName(nativeToken)
    const blockNumber = event.block.block.header.number.toBigInt()
    const accountIsNew = isNewAccount(toId, event);

    await handleDeposit(toId, tokenName, amount, event.block.timestamp, blockNumber, accountIsNew)
}

/*
handle balances.Withdraw
*/
export async function handleBalancesWithdraw(event: SubstrateEvent) {
    const [from, value] = event.event.data
    const fromId = from.toString()
    const amount = BigInt(value.toString())
    const tokenName = await getTokenName(nativeToken)
    const blockNumber = event.block.block.header.number.toBigInt()
    const accountIsNew = isNewAccount(fromId, event);

    await handleWithdrawn(fromId, tokenName, amount, event.block.timestamp, blockNumber, accountIsNew)
}

/*
handle balances.DustLost
*/
export async function handleBalancesDustLost(event: SubstrateEvent) {
    const [from, value] = event.event.data
    const fromId = from.toString()
    const amount = BigInt(value.toString())
    const tokenName = await getTokenName(nativeToken)
    const blockNumber = event.block.block.header.number.toBigInt()

    await handleWithdrawn(fromId, tokenName, amount, event.block.timestamp, blockNumber)
}

// handle balances.Reserved
export async function handleBalancesReserved(event: SubstrateEvent) {
    // Some balance was reserved (moved from free to reserved). \[who, value\]
    const [who, value] = event.event.data
    const account = who.toString()
    const amount = BigInt(value.toString())
    const nativeTokenName = await getTokenName(nativeToken)
    const blockNumber = event.block.block.header.number.toBigInt()

    await handleReserved(account, nativeTokenName, amount, event.block.timestamp, blockNumber)
}

// handle balances.Unreserved
export async function handleBalancesUnreserved(event: SubstrateEvent) {
    // Some balance was unreserved (moved from reserved to free). \[who, value\]
    const [who, value] = event.event.data
    const account = who.toString()
    const amount = BigInt(value.toString())
    const nativeTokenName = await getTokenName(nativeToken)
    const blockNumber = event.block.block.header.number.toBigInt()

    await handleUnReserved(account, nativeTokenName, amount, event.block.timestamp, blockNumber)
}

// 	handle balances.ReserveRepatriated
export async function handleBalancesReserveRepatriated(event: SubstrateEvent) {
    // Some balance was moved from the reserve of the first account to the second account.Final argument indicates the destination balance type.\[from, to, balance, destination_status\]
    const [from, to, balance, status] = event.event.data
    const fromId = from.toString()
    const toId = to.toString()
    const amount = BigInt(balance.toString())
    const nativeTokenName = await getTokenName(nativeToken)
    const blockNumber = event.block.block.header.number.toBigInt()

    await handleReservedRepatriated(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status as any,
        fromId,
        toId,
        nativeTokenName,
        amount,
        event.block.timestamp,
        blockNumber
    )
}

// handle currencies.Transferred
export async function handleCurrenciesTransfer(event: SubstrateEvent) {
    const [currency, from, to, amount] = event.event.data
    const fromId = from.toString()
    const toId = to.toString()
    const amountN = BigInt(amount.toString())
    const tokenName = await getTokenName(currency)
    const nativeName = await getTokenName(nativeToken)
    const blockNumber = event.block.block.header.number.toBigInt()

    // don't handle native token here
    if (tokenName === nativeName) return;

    await handleTransfer(tokenName, fromId, toId, amountN, event.block.timestamp, blockNumber)
}

/*
 handle currencies.Deposited

 DONT NEED handle balances.Deposit as we don't Deposit/Withdrawn any native token
 DONT NEED handle tokens.Endowed, as tokens.Endowed is appear with balances.Deposit
*/
export async function handleCurrenciesDeposite(event: SubstrateEvent) {
    // Deposit success. \[currency_id, who, amount\]
    const [currency, who, value] = event.event.data
    const recipientId = who.toString()
    const tokenName = await getTokenName(currency)
    const amount = BigInt(value.toString())
    const blockNumber = event.block.block.header.number.toBigInt()

    await handleDeposit(recipientId, tokenName, amount, event.block.timestamp, blockNumber)
}

// handle currencies.Withdrawn
export async function handleCurrenciesWithdrawn(event: SubstrateEvent) {
    // Withdraw success. \[currency_id, who, amount\]
    const [currency, who, value] = event.event.data
    const accountId = who.toString()
    const tokenName = await getTokenName(currency)
    const amount = BigInt(value.toString())
    const blockNumber = event.block.block.header.number.toBigInt()

    await handleWithdrawn(accountId, tokenName, amount, event.block.timestamp, blockNumber)
}

// handle currencies.DustSwept
export async function handleDustSwept(event: SubstrateEvent) {
    // Dust swept. \[currency_id, who, amount\]
    const [currency, who, value] = event.event.data
    const accountId = who.toString()
    const tokenName = await getTokenName(currency)
    const amount = BigInt(value.toString())
    const blockNumber = event.block.block.header.number.toBigInt()

    await handleTreasuryDeposit(accountId, tokenName, amount, event.block.timestamp, blockNumber)
}

// handle currencies.BalanceUpdated
export async function handleBalanceUpdatedEvent(event: SubstrateEvent) {
    // Update balance success. \[currency_id, who, amount\]
    const [currency, who, value] = event.event.data
    const accountId = who.toString()
    const tokenName = await getTokenName(currency)
    const amount = BigInt(value.toString())
    const blockNumber = event.block.block.header.number.toBigInt()

    await handleBalanceUpdated(accountId, tokenName, amount, event.block.timestamp, blockNumber)
}
