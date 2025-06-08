import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type {
  Coin,
  Customer,
  Network,
  Payment,
  PaymentLink,
} from "@saitamafun/sdk";

export type GlobalState = {
  coin: Coin | null;
  network: Network | null;
  payment: Payment | null;
  customer: Customer | null;
  paymentLink: PaymentLink | null;
  coinsState: ReturnType<typeof coinsEntityAdapter.getInitialState>;
};

const coinsEntityAdapter = createEntityAdapter({
  selectId: (model: Coin) => model.id,
});

const globalSlice = createSlice({
  name: "global",
  initialState: (): GlobalState => ({
    coin: null,
    network: null,
    customer: null,
    payment: null,
    paymentLink: null,
    coinsState: coinsEntityAdapter.getInitialState(),
  }),
  reducers: {
    setCustomer(state, { payload }: { payload: Customer }) {
      state.customer = payload;
    },
    setNetwork(state, { payload }: { payload: GlobalState["network"] }) {
      state.network = payload;
    },
    setCoin(state, { payload }: { payload: GlobalState["coin"] }) {
      state.coin = payload;
    },
    setPayment(state, { payload }: { payload: Payment }) {
      state.payment = payload;
    },
    setPaymentLink(state, { payload }: { payload: PaymentLink }) {
      state.paymentLink = payload;
    },
    setCoins: (state, { payload }: { payload: Coin[] }) => {
      coinsEntityAdapter.setAll(state.coinsState, payload);
    },
  },
});

export const globalReducer = globalSlice.reducer;
export const globalActions = globalSlice.actions;
export const coinsSelector = coinsEntityAdapter.getSelectors();
