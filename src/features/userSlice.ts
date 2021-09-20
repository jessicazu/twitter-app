import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../app/store'

interface USER {
  displayName: string
  photoUrl: string
}

const initialState = {
  user: {
    uid: '',
    photoUrl: '',
    displayName: '',
  },
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = initialState.user
    },
    updateUserProfile: (state, action: PayloadAction<USER>) => {
      state.user.displayName = action.payload.displayName
      state.user.photoUrl = action.payload.photoUrl
    },
  },
})

export const { login, logout, updateUserProfile } = userSlice.actions

export const selectUser = (state: RootState) => state.user.user

export default userSlice.reducer
