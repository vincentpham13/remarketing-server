import { RequestScope } from '@/models/request';
import { Package } from '@/models/package';
import { injectable } from 'inversify';
 
export interface IPackageRepo {
    getAllPackage(rs: RequestScope): Promise<Package[]>;
    getFreePackage(rs: RequestScope): Promise<Package>;

}

@injectable()
export class PackageRepo implements IPackageRepo{
    async getAllPackage(rs: RequestScope): Promise<Package[]>{
        rs.db.prepare();
        const packages = await rs.db.queryBuilder
            .select(["package.*"])
            .from<Package>("package");
        return packages;
    }

    async getFreePackage(rs: RequestScope): Promise<Package>{
        rs.db.prepare();
        const freePackage = await rs.db.queryBuilder
            .select(["package.*"])
            .from<Package>("package")
            .where("id", 1)
            .first();
        return freePackage;
    }
}