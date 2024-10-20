import { connectDatabase } from "./src/infra/mongo.ts";
import { getRoutes } from "./src/controller.ts";
import { GetRepositories } from "./src/infra/repository/index.ts";
import { removeDomainFromUrl } from "./src/utils/clean-url.ts";
import { logger } from "./src/infra/logger.ts";

(async () => {
  const database = await connectDatabase();
  const routes = getRoutes();
  const repositories = GetRepositories(database);

  for (const route of routes) {
    logger.log(`Loaded ${route.path}`);
  }

  Deno.serve({
    port: 8080,
    handler: async (request) => {
      const route = routes.find((route) =>
        route.path ===
          removeDomainFromUrl(request.headers.get("host")!, request.url)
      );
      if (route) {
        const response = await route.handler(request, repositories);
        return response;
      }

      if (request.headers.get("upgrade") !== "websocket") {
        const file = await Deno.open("./index.html", { read: true });
        return new Response(file.readable);
      }

      return new Response("Not found", { status: 404 });
    },
  });
})();
