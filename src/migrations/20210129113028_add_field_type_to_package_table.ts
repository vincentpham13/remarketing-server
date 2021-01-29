import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        alter table public.package
        add type int
    `);
}


export async function down(knex: Knex): Promise<void> {
}

