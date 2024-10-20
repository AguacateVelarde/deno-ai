import { Db } from "npm:mongodb";

export interface IGetCompanyContextRepository {
  create(companyContext: any): Promise<any>;
  findByCompanyId(companyId: string): Promise<any>;
}

export const GetCompanyContextRepository = (
  database: Db,
): IGetCompanyContextRepository => {
  const collection = database.collection("company_context");

  return {
    create(companyContext: any) {
      return collection.insertOne(companyContext);
    },
    findByCompanyId(companyId: string) {
      return collection.find({ companyId }).toArray();
    },
  };
};
