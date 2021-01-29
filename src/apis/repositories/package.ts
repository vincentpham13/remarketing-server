import { RequestScope } from '@/models/request';
import { Package, PackageCreate } from '@/models/package';
import { injectable } from 'inversify';

export interface IPackageRepo {
  getAllPackage(rs: RequestScope): Promise<Package[]>;
  getPackageById(rs: RequestScope, packageId: number): Promise<Package>;
  getPackagesByOrderId(rs: RequestScope, orderId: number): Promise<Package[]>;
  createPackage(rs: RequestScope, packagePlan: PackageCreate): Promise<Package>;
  updatePackage(rs: RequestScope, packageId: number, packagePlan: PackageCreate): Promise<Package>;
  removePackage(rs: RequestScope, packageId: number): Promise<any>;
}

@injectable()
export class PackageRepo implements IPackageRepo {
  async getAllPackage(rs: RequestScope): Promise<Package[]> {
    rs.db.prepare();
    const packages = await rs.db.queryBuilder
      .select(["package.*"])
      .from<Package>("package")
      .where("id", "<>", 1);
    return packages;
  }

  async getPackageById(rs: RequestScope, packageId: number): Promise<Package> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["package.*"])
      .from<Package>("package")
      .where("id", packageId)
      .first();
  }

  async getPackagesByOrderId(rs: RequestScope, orderId: number): Promise<Package[]> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["package.*"])
      .from<Package>("package")
      .leftJoin("order_package as op", "op.package_id", "=", "package.id")
      .where("op.order_id", orderId)
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

  async removePackage(rs: RequestScope, packageId: number): Promise<any> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .delete("*")
      .from<Package>("package")
      .where("id", packageId);
  }
}