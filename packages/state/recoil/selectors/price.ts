import { selectorFamily } from 'recoil'

import {
  NATIVE_DECIMALS,
  NATIVE_DENOM,
  USDC_SWAP_ADDRESS,
} from '@dao-dao/utils'

import { cosmWasmClientSelector, nativeBalanceSelector } from './chain'
import { cw20BalancesInfoSelector } from './clients/cw-core/0.1.0'
import { poolsListSelector } from './pools'

// Gets the price of a token in USDC / uTOKEN. DENOM may either be a native
// denomination or the address of a cw20 token. Price data is only avaliable for
// tokens that are tradable on Junoswap.
export const usdcPerMicroTokenSelector = selectorFamily<
  number | undefined,
  { denom: string }
>({
  key: 'tokenUSDCPriceSelector',
  get:
    ({ denom }) =>
    async ({ get }) => {
      const tokens = get(poolsListSelector)
      if (!tokens) {
        return
      }

      // Find swap for denom
      const denomSwap = tokens.pools.find(
        ({ pool_assets }) =>
          pool_assets.find(
            ({ denom: pool_denom, token_address }) =>
              pool_denom === denom || token_address === denom
          ) !== undefined
      )

      // No price information avaliable.
      if (!denomSwap) {
        return
      }

      // Find USDC swap by USDC_SWAP_ADDRESS
      const usdcSwap = tokens.pools.find(
        ({ swap_address }) => swap_address === USDC_SWAP_ADDRESS
      )

      const client = get(cosmWasmClientSelector)

      // Query for price of 1000000 tokens since decimals are not returned
      // by API. This will give us up to 10^-6 precision for calculations
      const tokenAmount = Math.pow(10, NATIVE_DECIMALS)

      // Query and calculate price for 1 native token
      // uUSDC / uJUNO
      const nativeUSDC =
        Number(
          (usdcSwap
            ? await client.queryContractSmart(usdcSwap.swap_address, {
                token1_for_token2_price: {
                  token1_amount: tokenAmount.toString(),
                },
              })
            : { token2_amount: '0' }
          ).token2_amount
        ) / tokenAmount

      // Don't need to query again for price of native token
      if (denom === NATIVE_DENOM) {
        // USDC / uJUNO
        return Number(nativeUSDC) / Math.pow(10, NATIVE_DECIMALS)
      }

      // Get juno price in terms of the native token.
      // uJUNO / uTOKEN
      const tokenPairPrice =
        Number(
          (
            await client.queryContractSmart(denomSwap.swap_address, {
              token2_for_token1_price: {
                token2_amount: tokenAmount.toString(),
              },
            })
          ).token1_amount
        ) / tokenAmount

      // price = (uUSDC / uJUNO) * (uJUNO / uTOKEN) = uUSDC / uTOKEN
      const price =
        (Number(nativeUSDC) * Number(tokenPairPrice)) /
        // Divide out the number of decimals in USDC.
        Math.pow(10, NATIVE_DECIMALS)

      return price
    },
})

export const addressTVLSelector = selectorFamily<number, { address: string }>({
  key: 'tokenUSDCPriceSelector',
  get:
    ({ address }) =>
    async ({ get }) => {
      const nativeBalances = get(nativeBalanceSelector(address))
      const cw20Balances = get(cw20BalancesInfoSelector(address))

      let balances = cw20Balances
        ? cw20Balances.map(({ amount, denom }) => ({ amount, denom }))
        : []
      if (nativeBalances) {
        balances = [nativeBalances].concat(balances)
      }

      const prices = balances.map(({ amount, denom }) => {
        const price = get(usdcPerMicroTokenSelector({ denom }))
        return price ? Number(amount) * price : 0
      })

      return prices.reduce((price, total) => price + total, 0)
    },
})
