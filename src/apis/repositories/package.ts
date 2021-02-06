import { RequestScope } from '@/models/request';
import { Package, PackageCreate } from '@/models/package';
import { injectable } from 'inversify';
import { Order, OrderPackage } from '@/models/order';

export interface IPackageRepo {
  getAllPackage(rs: RequestScope): Promise<Package[]>;
  getPackageById(rs: RequestScope, packageId: number): Promise<Package>;
  getPackagesByIds(rs: RequestScope, packageIds: number[]): Promise<Package[]>;
  getPackagesByOrderId(rs: RequestScope, orderId: number): Promise<Package[]>;
  getValidOrderPackagesByOrderId(rs: RequestScope, orderId: number): Promise<OrderPackage[]>;
  getTotalPriceByIds(rs: RequestScope, packageIds: number[]): Promise<number>;
  createPackage(rs: RequestScope, packagePlan: PackageCreate): Promise<Package>;
  updatePackage(rs: RequestScope, packageId: number, packagePlan: PackageCreate): Promise<Package>;
  removePackage(rs: RequestScope, packageId: number): Promise<any>;
  updateOrderPackage(rs: RequestScope, orderPackage: OrderPackage): Promise<OrderPackage>;

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

  async getPackagesByIds(rs: RequestScope, packageIds: number[]): Promise<Package[]> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["package.*"])
      .from<Package>("package")
      .whereIn("id", packageIds);
  }

  async getTotalPriceByIds(rs: RequestScope, packageIds: number[]): Promise<number> {
    rs.db.prepare();

    const result: any =  await rs.db.queryBuilder
      .sum({totalPrice: "price"})
      .from<Package>("package")
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
  
  async getValidOrderPackagesByOrderId(rs: RequestScope, orderId: number): Promise<OrderPackage[]> {
    rs.db.prepare();

    return await rs.db.queryBuilder
      .select(["op.*", "p.package_type_id"])
      .from<Package>("package as p")
      .innerJoin("order_package as op", "op.package_id", "=", "p.id")
      .where("op.order_id", orderId)
      .whereNull('applied_at');
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

  async updateOrderPackage(rs: RequestScope, orderPackage: OrderPackage): Promise<OrderPackage> {
    rs.db.prepare();
    const [updated] = await rs.db.queryBuilder
      .update(orderPackage)
      .into<OrderPackage>("order_package")
      .where("package_id", orderPackage.packageId)
      .where("order_id", orderPackage.orderId)
      .returning("*");
    return updated;
  }
}