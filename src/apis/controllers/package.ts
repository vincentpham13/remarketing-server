import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, interfaces } from "inversify-express-utils";
import { inject } from "inversify";
import TYPES from "@/inversify/TYPES";
import { IPackageService } from "../services/package";
import { IUserService } from "../services/user";
import { InternalServerError } from "@/utils/http";

@controller('/packages')
class PackageController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.PackageService) private packageService: IPackageService,

  ) {

  }
  
  @httpGet('/')
  private async getPackages(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const response = await this.packageService.getAllPackages(req.requestScope);
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }
}

export default PackageController;
