import { Identity } from "@/apis/middlewares";
import { Executor } from "@/providers/db";

export class RequestScope {
  private _identity: Identity;
  constructor(
    private _db: Executor,
    private _time: Date,
  ) {

  }

  get db(): Executor {
    return this._db;
  }

  get identity(): Identity {
    return this._identity;
  }

  set identity(iden: Identity) {
    this._identity = iden;
  }
  
  get time(): Date {
    return this._time;
  }
}