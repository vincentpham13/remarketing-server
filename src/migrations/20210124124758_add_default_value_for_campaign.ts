import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table public.campaign alter column total_messages set default 0;

  alter table public.campaign alter column success_messages set default 0;
  `)
}


export async function down(_knex: Knex): Promise<void> {
}

