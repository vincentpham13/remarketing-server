import { Request, Response, NextFunction } from 'express';
import { interfaces, controller, httpGet, httpPost, httpPut } from "inversify-express-utils";

import {
    AuthMiddleware
} from '@/apis/middlewares';

import { inject } from 'inversify';
import TYPES from '@/inversify/TYPES';

import { BadRequest, InternalServerError, Unauthorized } from '@/utils/http';
import { IOrderService } from '../services/order';
import { OrderStatus } from '@/enums/orderStatus';

@controller('/orders', AuthMiddleware())
class OrderController implements interfaces.Controller {
    constructor(
        @inject(TYPES.OrderService) private orderService: IOrderService,
    ) { }

    @httpGet('/')
    private async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const response = await this.orderService.getOrdersByUserId(req.requestScope, req.requestScope.identity.getID());
            res.status(200).json(response);
        } catch (error) {
            next(new InternalServerError(error));
        }
    }
    @httpPost('/')
    private async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const userId = req.requestScope.identity.getID();
            const {
                packageId,
            } = req.body;

            if (!packageId) {
                throw new BadRequest(null, "Invalid order");
            }

            const response = await this.orderService.createOrder(req.requestScope, {
                userId,
                packageId,
                status: OrderStatus.PENDING
            });

            res.status(200).json(response);
        } catch (error) {
            next(new InternalServerError(error));
        }
    }
}