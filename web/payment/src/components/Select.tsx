import { IconComponent } from "@web3icons/react";
import { MdCheck, MdExpandMore } from "react-icons/md";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

type SelectProps<
  T extends {
    readonly data?: unknown;
    readonly icon: IconComponent;
    readonly name: string;
  }
> = {
  items: readonly T[];
  label?: string;
  value: T;
  onChange: React.Dispatch<React.SetStateAction<T>>;
};

export default function Select<
  T extends {
    readonly data?: unknown;
    readonly icon: IconComponent;
    readonly name: string;
  }
>({ label, items, value, onChange }: SelectProps<T>) {
  return (
    <Listbox
      value={value}
      onChange={onChange}
    >
      <div className="relative flex flex-col space-y-17">
        <div className="flex flex-col space-y-2">
          {label && <label className="text-sm capitalize">{label}</label>}
          <ListboxButton className="flex items-center space-x-4 border p-2 rounded">
            <div className="flex-1 flex items-center space-x-2">
              <value.icon
                variant="branded"
                size={24}
              />
              <span className="capitalize">{value.name}</span>
            </div>
            <button>
              <MdExpandMore className="text-xl" />
            </button>
          </ListboxButton>
        </div>
        <ListboxOptions className="absolute inset-x-0 flex flex-col  divide-y bg-stone-100 z-10 rounded-b-md">
          {items.map((item, index) => {
            const { icon, name } = item;
            const Icon = icon;

            return (
              <ListboxOption
                key={index}
                value={item}
                className="group flex items-center space-x-4 p-2 cursor-pointer"
              >
                <div className="flex-1 flex items-center space-x-2">
                  <Icon
                    variant="branded"
                    size={24}
                  />
                  <span className="capitalize">{name}</span>
                </div>
                <div className="invisible group-data-[selected]:visible">
                  <MdCheck />
                </div>
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
