import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    alter table public.package
    add package_type_id smallint default 1 not null;

  alter table public.package
    add constraint package_package_type_id_fk
      foreign key (package_type_id) references package_type;
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  alter table public.package drop constraint package_package_type_id_fk;

  alter table public.package drop column package_type_id;
  
  `)
}

