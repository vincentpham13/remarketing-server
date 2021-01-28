import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        alter table public.order add column status varchar(100);
        alter table public.order add created_at timestamp without time zone DEFAULT now();
        alter table public.order add updated_at timestamp without time zone;
    `)
}


export async function down(knex: Knex): Promise<void> {
}

