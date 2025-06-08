import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { Network } from "@saitamafun/sdk";

const networksEntityAdapter = createEntityAdapter({
  selectId: (model: Network) => model.id,
});

const configsSlice = createSlice({
  name: "configs",
  initialState: {
    networkState: networksEntityAdapter.getInitialState(),
  },
  reducers: {
    setNetworks: (state, { payload }: { payload: Network[] }) => {
      networksEntityAdapter.setAll(state.networkState, payload);
    },
  },
});

export const configsReducer = configsSlice.reducer;
export const configsActions = configsSlice.actions;
export const networksSelector = networksEntityAdapter.getSelectors();
