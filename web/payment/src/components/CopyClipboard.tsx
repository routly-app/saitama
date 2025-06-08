import clsx from "clsx";
import { useState } from "react";
import copyTextToClipboard from "copy-text-to-clipboard";
import { MdCheckCircle, MdContentCopy } from "react-icons/md";

type CopyClipboardProps = {
  data: string;
};

export default function CopyClipboard({ data }: CopyClipboardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [timeout, setTimeout] = useState<number>();
  return (
    <button
      className={clsx(
        "transition-all duration-300 ease-in-out transform",
        isCopied ? "scale-125 text-green-500" : "scale-100 text-gray-700 dark:text-gray"
      )}
      onClick={() => {
        if (timeout) window.clearTimeout(timeout);
        const copied = copyTextToClipboard(data);
        setIsCopied(copied);
        setTimeout(window.setTimeout(() => setIsCopied(false), 5000));
      }}
    >
      {isCopied ? <MdCheckCircle /> : <MdContentCopy />}
    </button>
  );
}
