import { RequestScope } from '@/models/request';
import { Package, PackageCreate } from '@/models/package';
import { injectable } from 'inversify';

export interface IPackageRepo {
  getAllPackage(rs: RequestScope): Promise<Package[]>;
  getPackageById(rs: RequestScope, packageId: number): Promise<Package>;
  createPackage(rs: RequestScope, packagePlan: PackageCreate): Promise<Package>;
  updatePackage(rs: RequestScope, id: number, packagePlan: PackageCreate): Promise<Package>;
}

@injectable()
export class PackageRepo implements IPackageRepo {
  async getAllPackage(rs: RequestScope): Promise<Package[]> {
    rs.db.prepare();
    const packages = await rs.db.queryBuilder
      .select(["package.*"])
      .from<Package>("package");
    return packages;
  }

  async getPackageById(rs: RequestScope, packageId: number): Promise<Package> {
    rs.db.prepare();
    const freePackage = await rs.db.queryBuilder
      .select(["package.*"])
      .from<Package>("package")
      .where("id", packageId)
      .first();
    return freePackage;
  }

  async createPackage(rs: RequestScope, packagePlan: PackageCreate): Promise<Package> {
    rs.db.prepare();

    const [inserted] = await rs.db.queryBuilder
      .insert(packagePlan, "*")
      .into<Package>("package");

    return inserted;
  }

  async updatePackage(rs: RequestScope, id: number, packagePlan: PackageCreate): Promise<Package> {
    rs.db.prepare();

    const [updated] = await rs.db.queryBuilder
      .update(packagePlan)
      .into<Package>("package")
      .returning("*")
      .where("id", id);

    return updated;
  }
}