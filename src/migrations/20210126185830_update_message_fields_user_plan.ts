import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
    alter table public.user_plan add total_messages int;

    alter table public.user_plan add success_messages int;

    alter table public.user_plan drop column remaining_message; 
  `)
}


export async function down(knex: Knex): Promise<void> {
}

