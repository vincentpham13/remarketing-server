import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    alter table "order" drop constraint order_package_id_fk;

    alter table "order" drop column package_id;
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table "order"
	add constraint order_package_id_fk
		foreign key (package_id) references package;
`)
}

