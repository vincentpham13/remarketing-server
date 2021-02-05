import { RequestScope } from '@/models/request';
import { Package, PackageCreate } from '@/models/package';
import { injectable } from 'inversify';

export interface IPackageRepo {
  getAllPackage(rs: RequestScope): Promise<Package[]>;
  getPackageById(rs: RequestScope, packageId: number): Promise<Package>;
  getPackagesByOrderId(rs: RequestScope, orderId: number): Promise<Package[]>;
  getTotalPriceByIds(rs: RequestScope, packageIds: number[]): Promise<number>;
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

  async getTotalPriceByIds(rs: RequestScope, packageIds: number[]): Promise<number> {
    rs.db.prepare();

    const result: any =  await rs.db.queryBuilder
      .sum({totalPrice: "price"})
      .whereIn("id", packageIds)
    if(result && result.totalPrice){
      return result.totalPrice as number;
    }
    return 0;
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