import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table public.campaign alter column total_messages type int using total_messages::int;

  alter table public.campaign alter column success_messages type int using success_messages::int;
  `)
}


export async function down(_knex: Knex): Promise<void> {
}

