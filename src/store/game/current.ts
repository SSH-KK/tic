import { createEffect, restore } from 'effector'

import { BACKEND_URL } from '../../config'
import { notificationApi } from '../notification'

export const updateCurrentGameFx = createEffect(
  async ({ token }: { token: string }) => {
    const url = new URL(`${BACKEND_URL}/game/current`)
    url.search = new URLSearchParams({ token }).toString()
    let resp: Response
    try {
      resp = await fetch(url.toString())
    } catch (e) {
      throw new Error(e.toString())
    }
    if (!resp.ok) {
      throw new Error(`Invalid status ${resp.status}`)
    }
    const json = await resp.json()
    return json['gameId'] !== null
  },
)

export const currentGame = restore(updateCurrentGameFx.doneData, false)

updateCurrentGameFx.failData.watch(e => notificationApi.pushError(e.message))
