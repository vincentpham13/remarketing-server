import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `alter table public.page_member
	add name varchar(100) not null;
`)
}


export async function down(_knex: Knex): Promise<void> {
}

