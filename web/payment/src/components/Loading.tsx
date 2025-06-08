import clsx from "clsx";

type LoadingProps = {
  className?: string;
};

export default function Loading({ className }: LoadingProps) {
  return (
    <div
      className={clsx(
        "border-2 border-dashed rounded-full animate-spin animate-duration-2000",
        className
      )}
    />
  );
}
