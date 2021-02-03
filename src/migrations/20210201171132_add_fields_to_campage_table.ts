import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
        alter table public.campaign
            add message text not null,
            add started_at timestamp without time zone DEFAULT now();
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    alter table public.campaign drop column message;

    alter table public.campaign drop column started_at;    
    `)
}
