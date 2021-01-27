import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';
import { Package, PackageCreate } from '@/models/package';

import { } from '@/utils/http';
import { IPackageRepo } from '../repositories/package';

export interface IPackageService {
  getAllPackages(rs: RequestScope): Promise<Package[]>;
  createPackage(rs: RequestScope, packagePlan: PackageCreate): Promise<Package>;
  updatePackage(rs: RequestScope, id: number, packagePlan: PackageCreate): Promise<Package>;
  getFreePackage(rs: RequestScope, packageId: number): Promise<Package>;
}

@injectable()
export class PackageService implements IPackageService {
  @inject(TYPES.PackageRepo)
  private packageRepo: IPackageRepo;

  async getAllPackages(rs: RequestScope): Promise<Package[]> {
    try {
      return await this.packageRepo.getAllPackage(rs);
    } catch (error) {
      throw error;
    }
  }

  async getFreePackage(rs: RequestScope, packageId: number): Promise<Package> {
    try {
      const freePackage = await this.packageRepo.getPackageById(rs, packageId);
      return freePackage;
    } catch (error) {
      throw error;
    }
  }

  async createPackage(rs: RequestScope, packagePlan: PackageCreate): Promise<Package> {
    try {
      return rs.db.withTransaction<Package>(async () => {
        return await this.packageRepo.createPackage(rs, packagePlan);
      });
    } catch (error) {
      throw error;
    }
  }

  async updatePackage(rs: RequestScope, id: number, packagePlan: PackageCreate): Promise<Package> {
    try {
      return rs.db.withTransaction<Package>(async () => {
        return await this.packageRepo.updatePackage(rs, id, packagePlan);
      });
    } catch (error) {
      throw error;
    }
  }
}