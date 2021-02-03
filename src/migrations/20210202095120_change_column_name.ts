import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    alter table public.campaign_member rename column compaign_id to campaign_id;
  `);
}


export async function down(_knex: Knex): Promise<void> {
}

