import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  profile: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.loading = false;
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.profile = null;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, setProfile, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;
