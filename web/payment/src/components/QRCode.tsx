import { useLayoutEffect, useRef } from "react";
import QRCodeStyling, { type Options } from "qr-code-styling";

import useSize from "../composables/useSize";

type QRCodeProps = { className?: string } & Omit<Options, "width" | "height">;

export default function QRCode({ className, ...options }: QRCodeProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const qrCode = useRef<InstanceType<typeof QRCodeStyling>>(null);

  const [width, height] = useSize(wrapper);

  useLayoutEffect(() => {
    const params = {
      ...options,
      width,
      height,
    };
    
    if (qrCode.current) return qrCode.current.update(params);
    qrCode.current = new QRCodeStyling(params);
    
    if (container.current) qrCode.current.append(container.current);
  }, [options, width, height]);

  return (
    <div
      ref={wrapper}
      className={className}
    >
      <div ref={container} />
    </div>
  );
}
