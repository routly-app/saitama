import { type RefObject, useLayoutEffect, useState } from "react";

export default function useSize(element: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useLayoutEffect(() => {
    const onResize = () => {
      if (element.current) {
        const size = {
          width: element.current.offsetWidth,
          height: element.current.offsetHeight,
        };

        setSize(size);
      }
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [element]);

  return [size.width, size.height] as const;
}
