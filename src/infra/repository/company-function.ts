import { Db } from "npm:mongodb";

export interface IGetCompanyFunctionRepository {
  create(companyContext: any): Promise<any>;
  findByCompanyId(companyId: string): Promise<any>;
}

export const GetCompanyFunctionRepository = (
  database: Db,
): IGetCompanyFunctionRepository => {
  const collection = database.collection("company_function");

  return {
    create(companyContext: any) {
      return collection.insertOne(companyContext);
    },
    findByCompanyId(companyId: string) {
      return collection.find({ companyId }).toArray();
    },
  };
};
