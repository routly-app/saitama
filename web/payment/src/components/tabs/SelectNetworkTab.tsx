import { useCallback, useState } from "react";
import { MdExpandMore } from "react-icons/md";
import type { Network } from "@saitamafun/sdk";
import {
  TabPanel,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";

import { toSVGURL } from "../../utils/svgUtils";
import { networksSelector } from "../../store/configs";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { globalActions, type GlobalState } from "../../store/global";

type SelectNetworkTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default function SelectNetworkTab({
  as = TabPanel,
  onNext,
}: SelectNetworkTabProps) {
  const As = as;
  const dispatch = useAppDispatch();
  const { networkState } = useAppSelector((state) => state.configs);
  const networks = networksSelector.selectAll(networkState);

  const onSelect = useCallback(
    async (network: Network) => {
      dispatch(globalActions.setNetwork(network));
      return onNext();
    },
    [dispatch, onNext]
  );

  return (
    <As className="flex-1 flex flex-col space-y-1 divide-y px-4 overflow-y-scroll dark:divide-black">
      {networks.map((network, index) => (
        <NetworkButton
          key={index}
          network={network}
          onSelect={onSelect}
        />
      ))}
    </As>
  );
}

type NetworkButtonProps = {
  network: Network;
  onSelect: (network: GlobalState["network"]) => Promise<void>;
};

const NetworkButton = ({ network, onSelect }: NetworkButtonProps) => {
  const As = network.subchains ? Popover : "div";
  const Button = network.subchains ? PopoverButton : "button";

  const [isLoading, setLoading] = useState(false);

  return (
    <As
      as="div"
      className="relative flex flex-col space-y-2"
    >
      <Button
        disabled={isLoading}
        className="flex text-start items-center space-x-2 bg-stone-100 p-2 rounded-md dark:bg-dark-200"
        onClick={() => {
          if (network.subchains) return;
          setLoading(true);
          return onSelect(network).finally(() => setLoading(false));
        }}
      >
        <img
          src={toSVGURL(network.logo)}
          width={32}
          height={32}
          alt={network.name}
        />
        <span className="flex-1 capitalize">{network.name}</span>
        {network.subchains && (
          <div
            aria-label="Expand"
            className="p-2"
          >
            <MdExpandMore className="text-xl text-stone-700" />
          </div>
        )}
      </Button>
      {network.subchains && (
        <PopoverPanel className=" flex flex-col divide-y rounded-md bg-stone-100 dark:bg-dark-200 dark:divide-black">
          {network.subchains.map((chain, index) => (
            <NetworkButton
              key={index}
              network={chain}
              onSelect={onSelect}
            />
          ))}
        </PopoverPanel>
      )}
    </As>
  );
};
