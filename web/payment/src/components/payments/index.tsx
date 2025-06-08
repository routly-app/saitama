"use client";

import { MdChevronLeft, MdClose } from "react-icons/md";
import { Fragment, useCallback, useMemo, useState } from "react";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";

import Modal from "../Modal";
import SignUpTab from "../tabs/SignUpTab";
import SelectCoinTab from "../tabs/SelectCoinTab";
import { useAppSelector } from "../../store/hooks";
import SelectNetworkTab from "../tabs/SelectNetworkTab";
import WalletTransferTab from "../tabs/WalletTransferTab";

const tabs = [
  { name: "Sign up", component: SignUpTab },
  { name: "Select Network", component: SelectNetworkTab },
  { name: "Select Coin", component: SelectCoinTab },
  { name: "Payment Method", component: WalletTransferTab },
];

export default function PaymentModal() {
  const [open, setOpen] = useState(true);
  const { payment } = useAppSelector((state) => state.global);

  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (payment) return tabs.length - 1;
    else return 0;
  });
  const canBack = useMemo(() => selectedIndex > 0, [selectedIndex]);
  const currentTab = useMemo(() => tabs[selectedIndex], [selectedIndex]);

  const onBack = useCallback(() => {
    if (canBack) setSelectedIndex(selectedIndex - 1);
    else {
      const inFrame = window.self !== window.top;
      if (inFrame) {
        window.parent.postMessage({ type: "model/event", payload: "close" });
        setOpen(false);
      } else setOpen(true);
    }
  }, [canBack, selectedIndex]);

  const onClose = useCallback(() => {
    if (canBack) return;
    onBack();
  }, [canBack, onBack]);

  return (
    <TabGroup
      selectedIndex={selectedIndex}
      onChange={(index) => setSelectedIndex(index)}
    >
      <Modal
        open={open}
        onClose={onClose}
        onBack={onBack}
        closeIcon={canBack ? MdChevronLeft : MdClose}
        header={
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <p className="text-md md:text-sm">{currentTab.name}</p>
            <TabList className="flex items-center justify-center space-x-1">
              {tabs.map((_, index) => (
                <Tab
                  key={index}
                  as="div"
                  className="w-8 h-1 bg-violet/35 data-[selected]:bg-violet-700 rounded-full"
                />
              ))}
            </TabList>
          </div>
        }
      >
        <TabPanels as={Fragment}>
          {tabs.map((tab, index) => (
            <tab.component
              key={index}
              as={TabPanel}
              onNext={() => {
                if (selectedIndex < tabs.length - 1)
                  setSelectedIndex(selectedIndex + 1);
              }}
            />
          ))}
        </TabPanels>
      </Modal>
    </TabGroup>
  );
}
