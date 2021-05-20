import { createEffect, createEvent, createStore, forward } from 'effector'
import { navigateTo, routeIsActive } from 'svelte-router-spa'

import { BACKEND_URL } from '../config'

import { fetchSelfFx } from './self'

export type Token = string

type LoginData = {
  email: string
  password: string
}

type RegisterData = {
  email: string
  nickname: string
}

export const login = createEvent<LoginData>()
export const logout = createEvent()
export const register = createEvent<RegisterData>()

export const loginFx = createEffect<LoginData, string, Error>(
  async (data: LoginData) => {
    const form = new FormData()
    form.append('email', data.email)
    form.append('password', data.password)
    try {
      const resp = await fetch(`${BACKEND_URL}/user/login`, {
        method: 'POST',
        body: form,
      })
      if (!resp.ok) throw new Error(`Invalid return code ${resp.status}`)
      const json = await resp.json()
      if (json.error) throw new Error(json.error as string)
      return json.token as string
    } catch (e) {
      throw new Error(e.toString())
    }
  },
)

export const registerFx = createEffect<RegisterData, string, Error>(
  async (data: RegisterData) => {
    const form = new FormData()
    form.append('email', data.email)
    form.append('nickname', data.nickname)
    let resp: Response
    try {
      resp = await fetch(`${BACKEND_URL}/user/register`, {
        method: 'POST',
        body: form,
      })
    } catch (e) {
      throw new Error(e.toString())
    }
    if (!resp.ok) throw new Error(`Invalid return code ${resp.status}`)
    const json = await resp.json()
    if (json.error) throw new Error(json.error as string)
    return json.token as string
  },
)

forward({
  from: login,
  to: loginFx,
})

forward({
  from: register,
  to: registerFx,
})

export const auth = createStore<Token | null>(
  JSON.parse(localStorage.getItem('token')),
)
  .on(loginFx.doneData, (_, token: Token) => token)
  .on(registerFx.doneData, (_, token: Token) => token)
  .on(logout, () => {
    navigateTo('/login')
    return null
  })

auth.watch(state => localStorage.setItem('token', JSON.stringify(state)))

auth.watch(state => {
  fetchSelfFx(state)
  try {
    if (state && (routeIsActive('/login') || routeIsActive('/register'))) {
      navigateTo('/')
    }
  } catch (e) {}
})
