import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import {
  CwCoreV0_1_0Selectors,
  CwProposalSingleSelectors,
} from '@dao-dao/state'
import { ProposalIdDisplay } from '@dao-dao/ui'

import { useProposalModuleAdapterOptions } from '../../../../react'
import { BasePinnedProposalLineProps } from '../../../../types'
import { useProposalExpirationString } from '../../hooks'

export const PinnedProposalLineDesktop = ({
  className,
}: BasePinnedProposalLineProps) => {
  const { t } = useTranslation()
  const {
    proposalModule: { address: proposalModuleAddress, prefix: proposalPrefix },
    proposalNumber,
    Logo,
    coreAddress,
  } = useProposalModuleAdapterOptions()

  const { proposal } = useRecoilValue(
    CwProposalSingleSelectors.proposalSelector({
      contractAddress: proposalModuleAddress,
      params: [
        {
          proposalId: proposalNumber,
        },
      ],
    })
  )

  const daoConfig = useRecoilValue(
    CwCoreV0_1_0Selectors.configSelector({
      contractAddress: coreAddress,
    })
  )

  const expirationString = useProposalExpirationString()

  return (
    <div
      className={clsx(
        'grid grid-cols-[10ch_3fr_5fr_2fr] gap-4 items-center p-4 rounded-lg bg-primary',
        className
      )}
    >
      <p className="font-mono caption-text">
        <ProposalIdDisplay
          proposalNumber={proposalNumber}
          proposalPrefix={proposalPrefix}
        />
      </p>
      <div className="flex flex-row gap-2 items-center">
        {daoConfig.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={t('info.daosLogo')}
            className="w-5 h-5 rounded-full"
            src={daoConfig.image_url}
          />
        ) : (
          <Logo size="1.5rem" />
        )}
        <p className="link-text">{daoConfig.name}</p>
      </div>
      <p className="truncate link-text">{proposal.title}</p>
      <p className="text-right truncate body-text">{expirationString}</p>
    </div>
  )
}
