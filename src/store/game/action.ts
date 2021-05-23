import { createEvent } from 'effector'

import type { Coord } from '../../types/coord'

export const resign = createEvent()
export const pass = createEvent()
export const move = createEvent<Coord>()
