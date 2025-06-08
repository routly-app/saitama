import { configureStore } from "@reduxjs/toolkit";

import { globalReducer } from "./global";
import { configsReducer } from "./configs";

export const makeStore = () => {
  return configureStore({
    reducer: {
      global: globalReducer,
      configs: configsReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
