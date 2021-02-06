import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        alter table public.order_package
        add month_duration integer,
        add message_amount integer,
        add applied_at timestamp without time zone;
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        alter table public.order_package
        drop column month_duration,
        drop column message_amount,
        drop column applied_at;
    `);
}

