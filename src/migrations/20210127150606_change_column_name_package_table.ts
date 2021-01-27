import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table public.package rename column date_duration to month_duration;
  `)
}


export async function down(_knex: Knex): Promise<void> {
}

