import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table public."order"
	add full_name text not null;

  alter table public."order"
    add email text not null;

  alter table public."order"
    add phone text not null;

  alter table public."order"
    add address text not null;

  alter table public."order"
    add business_name text;

  alter table public."order"
    add business_address text;

  alter table public."order"
    add email_receipt text;
  `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
      
  `)
}

