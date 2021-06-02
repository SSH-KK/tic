import { addMessages, init, locale } from 'svelte-i18n'

import 'bulma/css/bulma.min.css'

import App from './App.svelte'
import './helpers/deadstones'

import en from './locales/en.json'
import ru from './locales/ru.json'

addMessages('en', en)
addMessages('ru', ru)

init({
  fallbackLocale: 'en',
  initialLocale: localStorage.getItem('locale') ?? 'en',
})

locale.subscribe(val => localStorage.setItem('locale', val))

const app = new App({
  target: document.body,
})

export default app
