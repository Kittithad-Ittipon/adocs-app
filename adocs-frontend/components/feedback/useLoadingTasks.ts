"use client";

import { useCallback, useRef, useState } from "react";

export function useLoadingTasks(initialTasks: string[]) {
  const [tasks, setTasks] = useState<Record<string, boolean>>(() => Object.fromEntries(initialTasks.map((task) => [task, true])));
  const versions = useRef<Record<string, number>>({});

  const run = useCallback(async (key: string, action: () => Promise<unknown>) => {
    const version = (versions.current[key] || 0) + 1;
    versions.current[key] = version;
    setTasks((previous) => previous[key] ? previous : { ...previous, [key]: true });
    try {
      return await action();
    } finally {
      // An older response must not hide the loading state of a newer request.
      if (versions.current[key] === version) {
        setTasks((previous) => ({ ...previous, [key]: false }));
      }
    }
  }, []);

  return { loading: Object.values(tasks).some(Boolean), run };
}
