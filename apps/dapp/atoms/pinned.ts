// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import { atom } from 'recoil'

import { localStorageEffect } from '@/atoms'

export const pinnedAddressesAtom = atom<string[]>({
  key: 'pinnedAddresses',
  default: [],
  effects: [localStorageEffect('pinnedAddresses')],
})

// When marking a proposal as done, either by voting on it or manually pressing
// the done button in the open list, add to this list so it gets ignored when
// fetching the open proposals. Map DAO core address to list of done proposal
// IDs by proposal module address.
export const pinnedProposalsMarkedDoneAtom = atom<
  Record<string, Record<string, number[] | undefined> | undefined>
>({
  key: 'pinnedProposalsMarkedDone',
  default: {},
  effects: [localStorageEffect('pinnedProposalsMarkedDone')],
})

// Map DAO core address to most recent proposal ID by proposal module address to
// NOT display on the homepage, for caching purposes. No need to load all
// proposals every time once all proposals before a certain point are marked
// done.
export const pinnedLatestProposalsMarkedDoneAtom = atom<
  Record<string, Record<string, number | undefined> | undefined>
>({
  key: 'pinnedLatestProposalsMarkedDone',
  default: {},
  effects: [localStorageEffect('pinnedLatestProposalsMarkedDone')],
})
