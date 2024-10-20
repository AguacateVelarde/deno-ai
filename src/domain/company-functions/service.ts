import type { Repositories } from "../../types.ts";
import type { CompanyFunctionDTO } from "./service.dto.ts";

export const saveCompanyFunction = (
  companyFunction: CompanyFunctionDTO,
  { companyFunctionRepository }: Repositories,
) => {
  return companyFunctionRepository.create({ ...companyFunction });
};
