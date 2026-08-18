type LogFields = {
  level: "info" | "error";
  msg: string;
  requestId?: string;
  route?: string;
  status?: number;
  env?: string;
  release?: string;
};

const FORBIDDEN = /authorization|cookie|token|secret|password|signed[_-]?url/i;

export function logEvent(fields: LogFields): void {
  for (const [key, value] of Object.entries(fields)) {
    if (FORBIDDEN.test(key) || (typeof value === "string" && FORBIDDEN.test(value))) {
      throw new Error("Refusing to log a forbidden field");
    }
  }
  console.warn(JSON.stringify(fields));
}
