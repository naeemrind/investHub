import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pitches: [],
  loading: false,
  error: null,
};

const pitchSlice = createSlice({
  name: "pitch",
  initialState,
  reducers: {
    setPitches(state, action) {
      state.pitches = action.payload;
    },
    addPitch(state, action) {
      state.pitches.unshift(action.payload);
    },
    removePitch(state, action) {
      state.pitches = state.pitches.filter((p) => p.id !== action.payload);
    },
    setPitchLoading(state, action) {
      state.loading = action.payload;
    },
    setPitchError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setPitches,
  addPitch,
  removePitch,
  setPitchLoading,
  setPitchError,
} = pitchSlice.actions;
export default pitchSlice.reducer;
