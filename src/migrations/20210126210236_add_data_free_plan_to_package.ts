import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    await knex.schema.raw(`
    INSERT INTO public.package
        ("label", date_duration, message_amount, price, status)
        VALUES('Miễn phí', 15, 1000, 0, 'pending');
    `)
}


export async function down(knex: Knex): Promise<void> {
}

