/**
 * This file was automatically generated by cosmwasm-typescript-gen@0.2.11.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the cosmwasm-typescript-gen generate command to regenerate this file.
 */

import { selectorFamily } from 'recoil'

import {
  DaoResponse,
  Cw4VotingClient as ExecuteClient,
  GroupContractResponse,
  InfoResponse,
  Cw4VotingQueryClient as QueryClient,
  TotalPowerAtHeightResponse,
  VotingPowerAtHeightResponse,
} from '../../../clients/cw4-voting'
import { signingCosmWasmClientAtom } from '../../atoms'
import { cosmWasmClientSelector } from '../chain'

type QueryClientParams = {
  contractAddress: string
}
export const queryClient = selectorFamily<QueryClient, QueryClientParams>({
  key: 'cw4VotingQueryClient',
  get:
    ({ contractAddress }) =>
    ({ get }) => {
      const client = get(cosmWasmClientSelector)
      return new QueryClient(client, contractAddress)
    },
})

export type ExecuteClientParams = {
  contractAddress: string
  sender: string
}

export const executeClient = selectorFamily<
  ExecuteClient | undefined,
  ExecuteClientParams
>({
  key: 'stakeCw20ExecuteClient',
  get:
    ({ contractAddress, sender }) =>
    ({ get }) => {
      const client = get(signingCosmWasmClientAtom)
      if (!client) return
      return new ExecuteClient(client, sender, contractAddress)
    },
  dangerouslyAllowMutability: true,
})

export const groupContractSelector = selectorFamily<
  GroupContractResponse,
  QueryClientParams & {
    params: Parameters<QueryClient['groupContract']>
  }
>({
  key: 'cw4VotingGroupContract',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.groupContract(...params)
    },
})
export const daoSelector = selectorFamily<
  DaoResponse,
  QueryClientParams & {
    params: Parameters<QueryClient['dao']>
  }
>({
  key: 'cw4VotingDao',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.dao(...params)
    },
})
export const votingPowerAtHeightSelector = selectorFamily<
  VotingPowerAtHeightResponse,
  QueryClientParams & {
    params: Parameters<QueryClient['votingPowerAtHeight']>
  }
>({
  key: 'cw4VotingVotingPowerAtHeight',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.votingPowerAtHeight(...params)
    },
})
export const totalPowerAtHeightSelector = selectorFamily<
  TotalPowerAtHeightResponse,
  QueryClientParams & {
    params: Parameters<QueryClient['totalPowerAtHeight']>
  }
>({
  key: 'cw4VotingTotalPowerAtHeight',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.totalPowerAtHeight(...params)
    },
})
export const infoSelector = selectorFamily<
  InfoResponse,
  QueryClientParams & {
    params: Parameters<QueryClient['info']>
  }
>({
  key: 'cw4VotingInfo',
  get:
    ({ params, ...queryClientParams }) =>
    async ({ get }) => {
      const client = get(queryClient(queryClientParams))
      return await client.info(...params)
    },
})
