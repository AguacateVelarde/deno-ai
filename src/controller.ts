import type { CompanyContextDTO } from "./domain/company-context/service.dto.ts";
import { saveCompanyContext } from "./domain/company-context/service.ts";
import type { CompanyFunctionDTO } from "./domain/company-functions/service.dto.ts";
import { saveCompanyFunction } from "./domain/company-functions/service.ts";
import { incomingCall } from "./domain/incoming-call/service.ts";
import { incomingWebhook } from "./domain/incoming-websocket/service.ts";
import type { Repositories } from "./types.ts";

export const getRoutes = () => {
  return [
    {
      path: "/api/v1/company-context",
      method: "POST",
      handler: async (
        request: Request,
        repositories: Repositories,
      ): Promise<Response> => {
        const payload = await request.json();

        const response = await saveCompanyContext(
          payload as unknown as CompanyContextDTO,
          repositories,
        );

        return new Response(JSON.stringify(response), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
    {
      path: "/api/v1/company-function",
      method: "POST",
      handler: async (
        request: Request,
        repositories: Repositories,
      ): Promise<Response> => {
        const payload = await request.json();

        const response = await saveCompanyFunction(
          payload as unknown as CompanyFunctionDTO,
          repositories,
        );

        return new Response(JSON.stringify(response), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
    {
      path: "/api/v1/incoming-websocket",
      method: "POST",
      handler: (
        request: Request,
        repositories: Repositories,
      ) => {
        return incomingWebhook(request, repositories);
      },
    },
    {
      path: "/api/v1/incoming-call",
      method: "POST",
      handler: (request: Request) => {
        const response = incomingCall(request);
        return new Response(
          response,
          {
            headers: { "Content-Type": "application/xml" },
          },
        );
      },
    },
  ];
};
