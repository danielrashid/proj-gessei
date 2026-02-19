import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = buildApp();

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`API executando em http://localhost:${env.PORT}`);
});
