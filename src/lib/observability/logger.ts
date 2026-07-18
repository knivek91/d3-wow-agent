import pino from "pino";

export function createLogger(requestId?: string) {
  const base = pino({
    level: "debug",
    browser: {
      write: (o) => {
        console.log(JSON.stringify(o));
      },
    },
  });
  return requestId ? base.child({ requestId }) : base;
}

export type Logger = ReturnType<typeof createLogger>;
