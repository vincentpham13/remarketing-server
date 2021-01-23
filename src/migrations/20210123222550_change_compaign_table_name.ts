import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
    --
    -- PostgreSQL database dump
    --
    
    -- Dumped from database version 13.1 (Debian 13.1-1.pgdg100+1)
    -- Dumped by pg_dump version 13.1 (Debian 13.1-1.pgdg100+1)
    
    SET statement_timeout = 0;
    SET lock_timeout = 0;
    SET idle_in_transaction_session_timeout = 0;
    SET client_encoding = 'UTF8';
    SET standard_conforming_strings = on;
    SELECT pg_catalog.set_config('search_path', '', false);
    SET check_function_bodies = false;
    SET xmloption = content;
    SET client_min_messages = warning;
    SET row_security = off;
    
    SET default_tablespace = '';
    
    -- SET default_table_access_method = heap;
    
    --
    -- Name: campaign; Type: TABLE; Schema: public; Owner: postgres
    --

    ALTER TABLE public.compaign RENAME TO campaign;
    ALTER TABLE public.compaign_member RENAME TO campaign_member;

    `);
}


export async function down(knex: Knex): Promise<void> {
}

