import clsx from "clsx";
import moment from "moment";
import Decimal from "decimal.js";
import { useMemo, useState } from "react";
import { TabPanel } from "@headlessui/react";
import { MdOutlineWarning } from "react-icons/md";

import Timer from "../Timer";
import QRCode from "../QRCode";
import Loading from "../Loading";
import Status from "../payments/Status";
import CopyClipboard from "../CopyClipboard";
import { toUIAmount } from "../../utils/format";
import { useAppSelector } from "../../store/hooks";
import { getObjectKeyOrThrow } from "../../utils/objectUtils";

type WalletTransferTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default function WalletTransferTab({
  as = TabPanel,
}: WalletTransferTabProps) {
  const As = as;
  const { payment } = useAppSelector((state) => state.global);

  const [expired, setIsExpired] = useState(false);
  const coin = useMemo(() => getObjectKeyOrThrow(payment, "coin"), [payment]);
  const network = useMemo(() => getObjectKeyOrThrow(coin, "network"), [coin]);
  const wallet = useMemo(
    () => getObjectKeyOrThrow(payment, "wallet"),
    [payment]
  );

  return (
    payment && (
      <>
        <As className="flex-1 flex flex-col space-y-4 px-4 pb-4 overflow-y-scroll">
          <div className="flex-1 flex flex-col space-y-4 overflow-y-scroll">
            <div className="flex items-center space-x-4">
              <div>
                <p>
                  Send&nbsp;
                  <b className="text-violet-700 dark:text-violet">
                    {coin.ticker}
                  </b>
                  &nbsp;via&nbsp;
                  <b className="text-violet-700 capitalize dark:text-violet">
                    {network.name}
                  </b>
                  &nbsp;Network
                </p>
                <p className="text-xs text-black/75 dark:text-stone-300 md:text-sm">
                  Open your crypto wallet or exchange and complete this payment
                  transfer.
                </p>
              </div>
              <div>
                <Timer
                  onExpired={setIsExpired}
                  epoch={moment(payment.createdAt).utc()}
                  maxTimeInMinutes={Number(process.env.NEXT_PUBLIC_EXPIRED_AT)}
                />
              </div>
            </div>
            <div className="my-auto flex flex-col space-y-4">
              <QRCode
                className="m-auto w-56 h-56 rounded-md"
                data={wallet.address}
              />
              <div className="flex flex-col divide-y bg-black/5 rounded-md dark:bg-dark-200/75 dark:divide-black">
                <div className="px-4 py-2">
                  <p className="font-medium">Amount</p>
                  <div className="flex items-center">
                    <p className="flex-1 text-xs text-black/50 dark:text-stone-300 md:text-sm">
                      {toUIAmount(
                        new Decimal(payment.amount)
                          .div(Math.pow(10, coin.decimals))
                          .toNumber()
                      )}
                      &nbsp;
                      {coin.ticker}
                    </p>
                    <CopyClipboard data={wallet.address} />
                  </div>
                </div>
                <div className="px-4 py-2">
                  <p className="font-medium">Address</p>
                  <div className="flex items-center space-x-4">
                    <p className="text-xs text-black/50 truncate dark:text-stone-300 md:text-sm">
                      {wallet.address}
                    </p>
                    <CopyClipboard data={wallet.address} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            className={clsx(
              "flex items-center justify-center  p-2.5 rounded-md",
              expired
                ? "bg-violet-700/50 text-white space-x-2"
                : "bg-violet-700 text-white space-x-4"
            )}
          >
            {expired ? (
              <>
                <MdOutlineWarning className="text-base" />
                <span>Link Expired</span>
              </>
            ) : (
              <>
                <span>Waiting for payment</span>
                <Loading className="size-5 border-white" />
              </>
            )}
          </button>
        </As>
        <Status paymentId={payment.id} />
      </>
    )
  );
}
