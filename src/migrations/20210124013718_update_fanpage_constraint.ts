import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table page_member
	add constraint page_member_pk_2
		unique (uid, page_id);
  `)
}


export async function down(_knex: Knex): Promise<void> {
}

