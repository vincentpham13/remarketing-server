import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
    `)
}


export async function down(knex: Knex): Promise<void> {
}

