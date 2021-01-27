import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table public.package alter column month_duration set default 0;

  alter table public.package alter column day_duration set default 0;  
  `)
}


export async function down(knex: Knex): Promise<void> {
}

