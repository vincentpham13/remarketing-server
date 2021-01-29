import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        drop index if exists order_user_id_uindex;
    `);
}


export async function down(knex: Knex): Promise<void> {
}

