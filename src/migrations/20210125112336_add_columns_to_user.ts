import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(
        `alter table public.user
        add phone varchar(100);
        alter table public.user
        add job varchar(100);
    `)
}


export async function down(_knex: Knex): Promise<void> {
}
