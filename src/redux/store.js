import { configureStore, createSlice } from '@reduxjs/toolkit'

const sessionSlice = createSlice({
  name: 'session',
  initialState: { user: null, token: null },
  reducers: {
    setSession: (state, { payload }) => { state.user = payload.user; state.token = payload.access_token },
    clearSession: (state) => { state.user = null; state.token = null },
  }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    setCart: (state, { payload }) => { state.items = payload },
  }
})

export const { setSession, clearSession } = sessionSlice.actions
export const { setCart } = cartSlice.actions

export const store = configureStore({
  reducer: { session: sessionSlice.reducer, cart: cartSlice.reducer }
})
