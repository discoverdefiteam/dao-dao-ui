import { Coin } from '@cosmjs/stargate'
import Emoji from 'a11y-react-emoji'
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TokenInfoResponse } from '@dao-dao/types/contracts/cw20-gov'
import {
  AddressInput,
  InputErrorMessage,
  NumberInput,
  SelectInput,
} from '@dao-dao/ui'
import {
  NATIVE_DECIMALS,
  NATIVE_DENOM,
  convertDenomToMicroDenomWithDecimals,
  convertMicroDenomToDenomWithDecimals,
  nativeTokenLabel,
  validateAddress,
  validatePositive,
  validateRequired,
} from '@dao-dao/utils'

import { ActionCard, ActionComponent } from '..'

interface SpendOptions {
  nativeBalances: readonly Coin[]
  cw20Balances: {
    address: string
    balance: string
    info: TokenInfoResponse
  }[]
}

export const SpendComponent: ActionComponent<SpendOptions> = ({
  fieldNamePrefix,
  onRemove,
  errors,
  isCreating,
  options: { nativeBalances, cw20Balances },
}) => {
  const { t } = useTranslation()
  const { register, watch, setValue, setError, clearErrors } = useFormContext()

  const spendAmount = watch(fieldNamePrefix + 'amount')
  const spendDenom = watch(fieldNamePrefix + 'denom')

  const validatePossibleSpend = useCallback(
    (id: string, amount: string): string | boolean => {
      const native = nativeBalances.find(({ denom }) => denom === id)
      if (native) {
        const microAmount = convertDenomToMicroDenomWithDecimals(
          amount,
          NATIVE_DECIMALS
        )
        return (
          Number(microAmount) <= Number(native.amount) ||
          t('error.cantSpendMoreThanTreasury', {
            amount: convertMicroDenomToDenomWithDecimals(
              native.amount,
              NATIVE_DECIMALS
            ).toLocaleString(undefined, {
              maximumFractionDigits: NATIVE_DECIMALS,
            }),
            tokenSymbol: nativeTokenLabel(id),
          })
        )
      }
      const cw20 = cw20Balances.find(({ address }) => address === id)
      if (cw20) {
        const microAmount = convertDenomToMicroDenomWithDecimals(
          amount,
          cw20.info.decimals
        )
        return (
          Number(microAmount) <= Number(cw20.balance) ||
          t('error.cantSpendMoreThanTreasury', {
            amount: convertMicroDenomToDenomWithDecimals(
              cw20.balance,
              cw20.info.decimals
            ).toLocaleString(undefined, {
              maximumFractionDigits: cw20.info.decimals,
            }),
            tokenSymbol: cw20.info.symbol,
          })
        )
      }
      // If there are no native tokens in the treasury the native balances
      // query will return an empty list.
      if (id === NATIVE_DENOM) {
        return t('error.cantSpendMoreThanTreasury', {
          amount: 0,
          tokenSymbol: nativeTokenLabel(NATIVE_DENOM),
        })
      }
      return 'Unrecognized denom.'
    },
    [cw20Balances, nativeBalances, t]
  )

  // Update amount+denom combo error each time either field is updated
  // instead of setting errors individually on each field. Since we only
  // show one or the other and can't detect which error is newer, this
  // would lead to the error not updating if amount set an error and then
  // denom was changed.
  useEffect(() => {
    if (!spendDenom || !spendAmount) {
      clearErrors(fieldNamePrefix + '_error')
      return
    }

    const validation = validatePossibleSpend(spendDenom, spendAmount)
    if (validation === true) {
      clearErrors(fieldNamePrefix + '_error')
    } else if (typeof validation === 'string') {
      setError(fieldNamePrefix + '_error', {
        type: 'custom',
        message: validation,
      })
    }
  }, [
    spendAmount,
    spendDenom,
    setError,
    clearErrors,
    validatePossibleSpend,
    fieldNamePrefix,
  ])

  const amountDecimals = useMemo(
    () =>
      cw20Balances.find(({ info }) => info.symbol === spendDenom)?.info
        ?.decimals ?? NATIVE_DECIMALS,
    [spendDenom, cw20Balances]
  )

  return (
    <ActionCard Icon={SpendIcon} onRemove={onRemove} title={t('title.spend')}>
      <div className="flex flex-row gap-4 items-center">
        <div className="flex flex-row gap-2 items-center">
          <NumberInput
            disabled={!isCreating}
            error={errors?.amount}
            fieldName={fieldNamePrefix + 'amount'}
            onMinus={() =>
              setValue(
                fieldNamePrefix + 'amount',
                Math.max(
                  Number(spendAmount) - 1,
                  1 / 10 ** amountDecimals
                ).toString()
              )
            }
            onPlus={() =>
              setValue(
                fieldNamePrefix + 'amount',
                Math.max(
                  Number(spendAmount) + 1,
                  1 / 10 ** amountDecimals
                ).toString()
              )
            }
            register={register}
            sizing="auto"
            step={1 / 10 ** amountDecimals}
            validation={[validateRequired, validatePositive]}
          />

          <SelectInput
            defaultValue={NATIVE_DENOM}
            disabled={!isCreating}
            error={errors?.denom}
            fieldName={fieldNamePrefix + 'denom'}
            register={register}
            style={{ maxWidth: '8.2rem' }}
          >
            {nativeBalances.map(({ denom }) => (
              <option key={denom} value={denom}>
                ${nativeTokenLabel(denom)}
              </option>
            ))}
            {cw20Balances.map(({ address, info: { symbol } }) => (
              <option key={address} value={address}>
                ${symbol}
              </option>
            ))}
          </SelectInput>
        </div>

        {/* eslint-disable-next-line i18next/no-literal-string */}
        <p className="font-mono text-2xl secondary-text">&#10142;</p>

        <div className="grow">
          <AddressInput
            containerClassName="grow"
            disabled={!isCreating}
            error={errors?.to}
            fieldName={fieldNamePrefix + 'to'}
            register={register}
            validation={[validateRequired, validateAddress]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <InputErrorMessage error={errors?.amount} />
        <InputErrorMessage error={errors?.denom} />
        <InputErrorMessage error={errors?.to} />
        <InputErrorMessage error={errors?._error} />
      </div>
    </ActionCard>
  )
}

export const SpendIcon = () => {
  const { t } = useTranslation()
  return <Emoji label={t('emoji.money')} symbol="💵" />
}
