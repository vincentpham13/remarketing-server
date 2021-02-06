import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        alter table public.campaign
        add column updated_at timestamp without time zone; 
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        alter table public.campaign
        drop column updated_at;
    `);
}

