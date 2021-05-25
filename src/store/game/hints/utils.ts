import { sample, forward, Effect, Event } from 'effector'

import { auth } from '../../auth'
import { notificationApi } from '../../notification'
import { boardApi, LeelaHint } from '../board'
import { gameSummary } from '../summary'
import { selectedApi, selectedCoords } from '../ui'
import type { HintParam } from './types'

type HintSampleParam = {
  clock: Event<void>
  target: Effect<HintParam, LeelaHint, Error>
}

export const registerHint = ({ clock, target }: HintSampleParam) => {
  target.failData.watch(e => notificationApi.pushError(e.message))
  forward({
    from: target.doneData,
    to: boardApi.pushLeelaHint,
  })
  forward({
    from: target.finally,
    to: selectedApi.clear,
  })

  target.doneData.watch(hint =>
    notificationApi.pushSuccess(`Used hint with price ${hint.price}`),
  )

  sample({
    clock,
    target,
    source: [auth, gameSummary, selectedCoords],
    fn: ([token, summary, coords]) => ({
      token,
      coords,
      gameId: summary.gameId,
    }),
  })
}
