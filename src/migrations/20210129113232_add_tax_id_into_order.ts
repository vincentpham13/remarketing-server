import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    alter table public."order"
    add tax_id varchar(10);
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    alter table public."order" drop column tax_id;
  `)
}

