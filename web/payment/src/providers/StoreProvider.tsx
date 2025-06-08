"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import type { Network, Payment, PaymentLink } from "@saitamafun/sdk";

import { useAppDispatch } from "../store/hooks";
import { globalActions } from "../store/global";
import { configsActions } from "../store/configs";
import { makeStore, type AppStore } from "../store";
import { getObjectKeyOrThrow } from "../utils/objectUtils";

export default function StoreProvider({ children }: React.PropsWithChildren) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return <Provider store={storeRef.current}>{children}</Provider>;
}

type StoreIntialState = {
  payment?: Payment;
  networks?: Network[];
  paymentLink?: PaymentLink;
};

export function StoreIntialState({
  payment,
  networks,
  paymentLink,
  children,
}: React.PropsWithChildren<StoreIntialState>) {
  const dispatch = useAppDispatch();
  const rendered = useRef<boolean>(null);

  if (!rendered.current && payment) {
    const customer = getObjectKeyOrThrow(payment, "customer");
    const network = networks.find(
      (network) =>
        network.id ===
        getObjectKeyOrThrow(getObjectKeyOrThrow(payment, "coin"), "network").id
    );

    dispatch(globalActions.setPayment(payment));
    dispatch(globalActions.setNetwork(network));
    dispatch(globalActions.setCustomer(customer));
  }
  if (!rendered.current && paymentLink)
    dispatch(globalActions.setPaymentLink(paymentLink));
  if (!rendered.current && networks)
    dispatch(configsActions.setNetworks(networks));

  useEffect(() => {
    rendered.current = true;
  }, [rendered]);

  return children;
}
