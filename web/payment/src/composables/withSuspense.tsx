import { Suspense, type ComponentType } from "react";

export default function withSuspense<T extends ComponentType<any>>(
  Component: T
) {
  return function (props: React.ComponentProps<T>) {
    return (
      <Suspense>
        <Component {...props} />
      </Suspense>
    );
  };
}
