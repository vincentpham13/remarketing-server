import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table public.package
	add day_duration int;
  `)
}


export async function down(_knex: Knex): Promise<void> {
}

