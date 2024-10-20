import type { IGetCompanyContextRepository } from "./infra/repository/company-context.ts";
import type { IGetCompanyFunctionRepository } from "./infra/repository/company-function.ts";
import type { IEmbeddingsRepository } from "./infra/repository/embedding.ts";

export interface Repositories {
  companyContextRepository: IGetCompanyContextRepository;
  embeddingsRepository: IEmbeddingsRepository;
  companyFunctionRepository: IGetCompanyFunctionRepository;
}
