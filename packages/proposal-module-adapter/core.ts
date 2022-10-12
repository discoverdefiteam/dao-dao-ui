import { ProposalModule } from '@dao-dao/utils'

import {
  IProposalModuleAdapterInitialOptions,
  IProposalModuleAdapterOptions,
  IProposalModuleContext,
  ProposalModuleAdapter,
} from './types'

const registeredAdapters: ProposalModuleAdapter[] = []

// Lazy loading adapters instead of defining objects reduces memory usage
// and avoids cyclic dependencies when enums or other objects are stored in
// the adapter object.
export const registerAdapters = (adapters: ProposalModuleAdapter[]) =>
  registeredAdapters.push(
    // Avoid duplicates.
    ...adapters.filter(
      ({ id }) => !registeredAdapters.some((registered) => registered.id === id)
    )
  )

export const matchAdapter = (contractName: string) =>
  registeredAdapters.find(({ matcher }) => matcher(contractName))

export const matchAndLoadCommon = (
  proposalModule: ProposalModule,
  initialOptions: IProposalModuleAdapterInitialOptions
) => {
  const adapter = matchAdapter(proposalModule.contractName)

  if (!adapter) {
    throw new ProposalModuleAdapterError(
      `Failed to find proposal module adapter matching contract "${
        proposalModule.contractName
      }". Registered adapters: ${registeredAdapters
        .map(({ id }) => id)
        .join(', ')}`
    )
  }

  return adapter.loadCommon({
    ...initialOptions,
    proposalModule,
  })
}

export const matchAndLoadAdapter = (
  proposalModules: ProposalModule[],
  proposalId: string,
  initialOptions: IProposalModuleAdapterInitialOptions
): IProposalModuleContext => {
  // Last character of prefix is non-numeric, followed by numeric prop number.
  const proposalIdParts = proposalId.match(/^(.*\D)?(\d+)$/)
  if (proposalIdParts?.length !== 3) {
    throw new ProposalModuleAdapterError('Failed to parse proposal ID.')
  }

  // Undefined if matching group doesn't exist, i.e. no prefix exists.
  const proposalPrefix = proposalIdParts[1] ?? ''

  const proposalNumber = Number(proposalIdParts[2])
  if (isNaN(proposalNumber)) {
    throw new ProposalModuleAdapterError(
      `Invalid proposal number "${proposalNumber}".`
    )
  }

  const proposalModule = proposalPrefix
    ? proposalModules.find(({ prefix }) => prefix === proposalPrefix)
    : // If no proposalPrefix (i.e. proposalId is just a number), and there is
    // only one proposal module, return it. This should handle backwards
    // compatibility when there were no prefixes and every DAO used
    // cw-proposal-single.
    proposalModules.length === 1
    ? proposalModules[0]
    : undefined
  if (!proposalModule) {
    throw new ProposalModuleAdapterError(
      `Failed to find proposal module for prefix "${proposalPrefix}".`
    )
  }

  const adapter = matchAdapter(proposalModule.contractName)

  if (!adapter) {
    throw new ProposalModuleAdapterError(
      `Failed to find proposal module adapter matching contract "${
        proposalModule.contractName
      }". Registered adapters: ${registeredAdapters
        .map(({ id }) => id)
        .join(', ')}`
    )
  }

  const adapterOptions: IProposalModuleAdapterOptions = {
    ...initialOptions,
    proposalModule,
    proposalId,
    proposalNumber,
  }

  return {
    id: adapter.id,
    options: adapterOptions,
    adapter: adapter.load(adapterOptions),
    common: matchAndLoadCommon(proposalModule, initialOptions),
  }
}

export class ProposalModuleAdapterError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProposalModuleAdapterError'
  }
}
