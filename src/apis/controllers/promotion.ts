import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, interfaces } from "inversify-express-utils";
import { inject } from "inversify";
import TYPES from "@/inversify/TYPES";
import { IPromotionService } from "../services/promotion";
import { IUserService } from "../services/user";
import { BadRequest, InternalServerError } from "@/utils/http";

@controller('/promotions')
class PromotionController implements interfaces.Controller {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.PromotionService) private promotionService: IPromotionService,

  ) {

  }
  
  @httpGet('/code/:promotionCode')
  private async getPromotions(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {promotionCode} = req.params;
      const response = await this.promotionService.getPromotionByCode(req.requestScope, promotionCode);
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

  @httpPost('/code/:promotionCode')
  private async checkValidPromotion(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {
        promotionCode,
      } = req.params;


      const {
        packageIds,
        orderPrice
      } = req.body;

      const promotion = await this.promotionService.getPromotionByCode(req.requestScope, promotionCode);
      if(!promotion) {
        throw new BadRequest(null, "Promotion not exist");
      }

      const response = await this.promotionService.checkValidPromotions(promotion, packageIds, orderPrice);
      res.status(200).json(response);
    } catch (error) {
      next(new InternalServerError(error, ""));
    }
  }

}

export default PromotionController;
