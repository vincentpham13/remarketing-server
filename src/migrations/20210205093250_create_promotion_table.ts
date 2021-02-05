import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE public.promotion (
            id SERIAL,
            code character varying(100) NOT NULL,
            description character varying(100),
            quantity bigint NOT NULL default 0,
            valid_packages bigint[],
            month_duration integer,
            message_amount integer,
            valid_price integer,
            can_use_with_other boolean default false,
            valid_to timestamp without time zone NOT NULL,
            created_at timestamp  without time zone DEFAULT now(),
            updated_at timestamp without time zone,
            CONSTRAINT promotion_pk PRIMARY KEY (id),
            UNIQUE(code)
        );
        create table public.order_promotion
        (
            order_id int not null
            constraint order_promotion_order_id_fk
                references public."order",
                promotion_id smallint not null
            constraint order_promotion_promotion_id_fk
                references public.promotion,
            applied_at timestamp without time zone,
            constraint order_promotion_pk
            primary key (order_id, promotion_id)
        );
    `);
    
}


export async function down(knex: Knex): Promise<void> {
}

