import { inject, injectable } from 'inversify';
import TYPES from '@/inversify/TYPES';
import { RequestScope } from '@/models/request';
import { Package } from '@/models/package';

import { } from '@/utils/http';
import { IPackageRepo } from '../repositories/package';

export interface IPackageService {
  getAllPackage(rs: RequestScope): Promise<Package[]>;
  getFreePackage(rs: RequestScope, packageId: number): Promise<Package>;
}

@injectable()
export class PackageService implements IPackageService {
  @inject(TYPES.PackageRepo)
  private packageRepo: IPackageRepo;

  async getAllPackage(rs: RequestScope): Promise<Package[]> {
    try {
      const packages = await this.packageRepo.getAllPackage(rs);
      return packages;
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
}