import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    create table public.package_type
    (
      id smallserial
        constraint package_type_pk
          primary key,
      label varchar(20) not null
    );

    insert into public.package_type (label) values ('Time and Message');
    insert into public.package_type (label) values ('Message Only');
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    drop table if exists public.package_type;
  `)
}

