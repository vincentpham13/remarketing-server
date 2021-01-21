import Knex, { QueryBuilder, Transaction, Config } from "knex";
// @ts-ignore
import knexStringCase from "knex-stringcase";
import { cwd } from "process";

// import { AppConfig } from "@/config";
// import { logger } from "@/utils/logger";

export interface IExecutor {
  queryBuilder: QueryBuilder;
  setTransaction(tx: Transaction): void;
  prepare(): void;
}

type FuncExecutor = () => Promise<any>;
export class Executor implements IExecutor {
  queryBuilder: Knex.QueryBuilder<any, any[]>;
  client: Knex;
  constructor(knex: Knex) {
    this.queryBuilder = knex.queryBuilder();
    this.client = knex;
  }

  setTransaction(tx: Knex.Transaction<any, any>): void {
    this.queryBuilder.transacting(tx);
  }

  prepare(): void {
    this.queryBuilder = this.client.queryBuilder();
  }

  async withTransaction<T extends {} = any>(f: FuncExecutor): Promise<T> {
    const tranx = await this.client.transaction();
    this.setTransaction(tranx);
    try {
      const result = await f();
      tranx.commit();
      return result;
    } catch (error) {
      tranx.rollback();
      throw error;
    }
  }
}

export default class DB {
  private static _instance: DB;
  // @ts-ignore
  private _connection: Executor = null;

  private constructor() { }

  static getInstance(): DB {
    if (!DB._instance) {
      DB._instance = new DB();
    }

    return DB._instance;
  }

  get connection(): Executor {
    return this._connection;
  }

  set connection(executor: Executor) {
    this._connection = executor;
  }

  connectDb(): void {
    const knexOptions: Config = {
      client: "pg",
      connection: {
        host: 'localhost',
        port: 5432,
        user: 'getme',
        password: 'getme123!@#',
        database: 'extension',
        ssl: false
      },
      searchPath: ["public"],
      migrations: {
        database: 'extension',
        directory: `${cwd()}/src/migrations`,
        extension: "ts"
      }
    };
    const knexClient = Knex(knexStringCase(knexOptions));

    this._connection = new Executor(knexClient);
  }
}
