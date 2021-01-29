import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  create table public.order_package
  (
    order_id int not null
      constraint order_package_order_id_fk
        references public."order",
    package_id smallint not null
      constraint order_package_package_id_fk
        references public.package,
    constraint order_package_pk
      primary key (order_id, package_id)
  );
  `)
}


export async function down(knex: Knex): Promise<void> {
}

