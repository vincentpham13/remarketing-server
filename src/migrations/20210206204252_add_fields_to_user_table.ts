import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        alter table public.user
        add company_name varchar(100),
        add city varchar(100);
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        alter table public.user
        drop column company_name,
        drop column city;
    `);
}

