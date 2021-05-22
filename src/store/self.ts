import { createStore, createEffect } from 'effector'

import { BACKEND_URL } from '../config'
import type { User } from '../types/user'

export const fetchSelfFx = createEffect<string | null, User | null>(
  async token => {
    if (token === null) return null
    const url = new URL(`${BACKEND_URL}/user/profile`)
    url.search = new URLSearchParams({ token }).toString()
    let resp: Response
    try {
      resp = await fetch(url.toString())
    } catch (e) {
      throw new Error(e.toString())
    }
    if (!resp.ok) throw new Error(`Invalid return code ${resp.status}`)
    const json = await resp.json()
    if (typeof json['user'] === 'object') return json['user']
    else return null
  },
)

export const self = createStore<User | null>(null).on(
  fetchSelfFx.doneData,
  (_, user) => user,
)
