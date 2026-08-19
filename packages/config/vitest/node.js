/** Shared Vitest config for Node-side packages and the Worker. */
export const nodeVitest = {
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
};
