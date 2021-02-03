import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    alter table public.campaign alter column status set default 'pending'::text;
  `);
}


export async function down(_knex: Knex): Promise<void> {
}

