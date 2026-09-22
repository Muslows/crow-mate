/**
 * Point d’entrée Phusion Passenger (o2switch → Setup Node.js App).
 * Startup file : server.cjs
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const app = next({
  dev: false,
  dir: __dirname,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsed = parse(req.url ?? "/", true);
    handle(req, res, parsed);
  });

  if (typeof PhusionPassenger !== "undefined") {
    server.listen("passenger");
    return;
  }

  const port = Number(process.env.PORT || 3000);
  server.listen(port, "0.0.0.0");
});
