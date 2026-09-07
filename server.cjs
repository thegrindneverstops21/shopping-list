const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = Number(process.env.PORT || 3001);

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(router);
server.listen(port, "0.0.0.0", () => {
  console.log(`API server listening on port ${port}`);
});