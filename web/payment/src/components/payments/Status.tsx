import clsx from "clsx";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";
import { MdCheckCircle, MdError } from "react-icons/md";

import { globalActions } from "../../store/global";
import { useAPI } from "../../contexts/APIContext";
import { getObjectKeyOrThrow } from "../../utils/objectUtils";
import { toUIAmount, truncateAddress } from "../../utils/format";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function Status({ paymentId }: { paymentId: string }) {
  const api = useAPI();
  const dispatch = useAppDispatch();
  const [interval, setInterval] = useState<number>();
  const { payment } = useAppSelector((state) => state.global);

  const coin = getObjectKeyOrThrow(payment, "coin");

  useEffect(() => {
    if (payment.status === "pending")
      setInterval(
        window.setInterval(() => {
          api.api.payment
            .retrieve(paymentId)
            .then(({ data }) => dispatch(globalActions.setPayment(data)));
        }, 50000)
      );

    return () => window.clearInterval(interval);
  }, [paymentId]);

  if (payment.status !== "pending")
    return (
      <div
        className={clsx(
          "absolute inset-0 flex flex-col space-y-4 items-center justify-center  rounded-md z-10",
          payment.status === "success" ? "animate-bounce-in bg-green-500" : "animate-bounce-in bg-red-500"
        )}
      >
        <div className="relative">
          <div
            className={clsx(
              "absolute inset-0 p-2 animate-pulse rounded-full -z-5",
              payment.status === "success" ? "bg-green-50/50" : "bg-red-300"
            )}
          />
          {payment.status === "success" ? (
            <MdCheckCircle className="text-8xl z-10" />
          ) : (
            <MdError className="text-8xl z-10" />
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col text-center">
            <h1 className="text-base font-medium">
              Payment {payment.status === "success" ? "Successful" : "Failed"}
            </h1>
            <p className="text-sm text-white/75">
              Got&nbsp;
              {toUIAmount(
                new Decimal(payment.amount)
                  .div(Math.pow(10, coin.decimals))
                  .toNumber()
              )}
              &nbsp;
              {coin.ticker} From&nbsp;
              <a
                href="$"
                target="_blank"
                className="underline underline-dashed"
              >
                {truncateAddress(payment.metadata.transaction.from)}
              </a>
            </p>
          </div>
          <button
            className={clsx(
              " bg-white px-4 py-2 rounded-md",
              payment.status === "success" ? "text-green-500" : "text-red-500"
            )}
          >
            Back
          </button>
        </div>
      </div>
    );
}
