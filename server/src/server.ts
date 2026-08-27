import fastify from "fastify";
import routes from "./routes/index.js";
import cors from "@fastify/cors";

const app = fastify({
  logger: false,
});

const urlDevelop = process.env.URL_DEVELOP;
const port = process.env.PORT;

if (!urlDevelop) {
  throw new Error("Informe a url do frontend.");
}

if (!port) {
  throw new Error("Informe uma porta.");
}

const start = async () => {
  await app.register(cors, {
    origin: urlDevelop,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(routes);

  try {
    await app.listen({
      port: Number(port),
      host: "0.0.0.0",
    });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();