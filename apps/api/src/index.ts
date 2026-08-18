import { createApp } from "./app/create-app.js";

const app = createApp();

export default {
  fetch: app.fetch,
};
