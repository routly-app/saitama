import moment, { type Moment } from "moment";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

type TimerProps = {
  epoch: Moment;
  maxTimeInMinutes: number;
  onExpired?: (expired: boolean) => void;
};

export default forwardRef<
  { epochSeconds: number; isExpired: boolean },
  TimerProps
>(function Timer({ epoch, maxTimeInMinutes, onExpired }, ref) {
  const [epochSeconds, setEpochSeconds] = useState(() => {
    const end = epoch.clone().add(maxTimeInMinutes, "minutes");
    const diff = end.diff(moment().utc(), "seconds");

    return diff > 0 ? diff : 0;
  });

  const isExpired = useMemo(() => epochSeconds <= 0, [epochSeconds]);
  const relativeEpoch = useMemo(() => {
    return moment.duration(epochSeconds > 0 ? epochSeconds : 0, "seconds");
  }, [epochSeconds]);

  useEffect(() => {
    if (epochSeconds > 0) {
      const interval = window.setInterval(() => {
        setEpochSeconds((seconds) => {
          if (seconds <= 1) window.clearInterval(interval);
          return Math.max(seconds - 1, 0);
        });
      }, 1000);

      return () => window.clearInterval(interval);
    }
  }, [epochSeconds]);

  useImperativeHandle(ref, () => ({ epochSeconds, isExpired }));

  useEffect(() => {
    if (isExpired) onExpired(isExpired);
  }, [isExpired, onExpired]);

  return (
    <p className="font-mono text-sm">
      {relativeEpoch.minutes().toString().padStart(2, "0")}:
      {relativeEpoch.seconds().toString().padStart(2, "0")}
    </p>
  );
});
