import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    insert into role(label) values ('user');
    insert into role(label) values ('admin');

    insert into package(id, label, date_duration, message_amount, price) values (1, 'Miễn phí', 15, 1000, 0);
  `)
}


export async function down(_knex: Knex): Promise<void> {
}

