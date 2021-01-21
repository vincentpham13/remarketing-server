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

SET default_table_access_method = heap;

--
-- Name: compaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compaign (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    creator_id character varying(100) NOT NULL,
    page_id character varying(100) NOT NULL,
    total_messages bigint NOT NULL,
    success_messages bigint NOT NULL,
    filtered_by jsonb,
    status text DEFAULT 'running'::text NOT NULL
);


ALTER TABLE public.compaign OWNER TO postgres;

--
-- Name: compaign_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compaign_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.compaign_id_seq OWNER TO postgres;

--
-- Name: compaign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compaign_id_seq OWNED BY public.compaign.id;


--
-- Name: compaign_member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compaign_member (
    compaign_id bigint,
    page_member_id bigint
);


ALTER TABLE public.compaign_member OWNER TO postgres;


--
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id integer NOT NULL,
    user_id character varying(100),
    package_id smallint NOT NULL
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_id_seq OWNER TO postgres;

--
-- Name: order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_id_seq OWNED BY public."order".id;


--
-- Name: package; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.package (
    id smallint NOT NULL,
    label character varying(50) NOT NULL,
    date_duration integer NOT NULL,
    message_amount integer NOT NULL,
    price integer,
    status text DEFAULT 'pending'::text NOT NULL
);


ALTER TABLE public.package OWNER TO postgres;

--
-- Name: package_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.package_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.package_id_seq OWNER TO postgres;

--
-- Name: package_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.package_id_seq OWNED BY public.package.id;


--
-- Name: page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page (
    id character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE public.page OWNER TO postgres;

--
-- Name: page_imported_member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_imported_member (
    id bigint NOT NULL,
    uid character varying(100) NOT NULL,
    page_id character varying(100) NOT NULL,
    tags text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE public.page_imported_member OWNER TO postgres;

--
-- Name: page_imported_member_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.page_imported_member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.page_imported_member_id_seq OWNER TO postgres;

--
-- Name: page_imported_member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.page_imported_member_id_seq OWNED BY public.page_imported_member.id;


--
-- Name: page_member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_member (
    id bigint NOT NULL,
    uid character varying(100) NOT NULL,
    page_id character varying(100) NOT NULL,
    tags text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE public.page_member OWNER TO postgres;

--
-- Name: page_member_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.page_member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.page_member_id_seq OWNER TO postgres;

--
-- Name: page_member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.page_member_id_seq OWNED BY public.page_member.id;


--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id smallint NOT NULL,
    label character varying(20)
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id character varying(100) NOT NULL,
    name character varying(100),
    email character varying(100),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    active boolean,
    role_id smallint,
    token text NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_page (
    user_id character varying(100),
    page_id character varying(100)
);


ALTER TABLE public.user_page OWNER TO postgres;

--
-- Name: user_plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_plan (
    user_id character varying(100) NOT NULL,
    package_id smallint NOT NULL,
    remaining_message integer NOT NULL,
    valid_to timestamp without time zone
);


ALTER TABLE public.user_plan OWNER TO postgres;

--
-- Name: compaign id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compaign ALTER COLUMN id SET DEFAULT nextval('public.compaign_id_seq'::regclass);





--
-- Name: order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order" ALTER COLUMN id SET DEFAULT nextval('public.order_id_seq'::regclass);


--
-- Name: package id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package ALTER COLUMN id SET DEFAULT nextval('public.package_id_seq'::regclass);


--
-- Name: page_imported_member id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_imported_member ALTER COLUMN id SET DEFAULT nextval('public.page_imported_member_id_seq'::regclass);


--
-- Name: page_member id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_member ALTER COLUMN id SET DEFAULT nextval('public.page_member_id_seq'::regclass);


--
-- Data for Name: compaign; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: compaign_member; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: package; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: page; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: page_imported_member; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: page_member; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_page; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_plan; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: compaign_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compaign_id_seq', 1, false);





--
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_id_seq', 1, false);


--
-- Name: package_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.package_id_seq', 1, false);


--
-- Name: page_imported_member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.page_imported_member_id_seq', 1, false);


--
-- Name: page_member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.page_member_id_seq', 1, false);


--
-- Name: compaign_member compaign_member_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compaign_member
    ADD CONSTRAINT compaign_member_pk UNIQUE (compaign_id, page_member_id);


--
-- Name: compaign compaign_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compaign
    ADD CONSTRAINT compaign_pk PRIMARY KEY (id);


--
-- Name: order order_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pk PRIMARY KEY (id);


--
-- Name: package package_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package
    ADD CONSTRAINT package_pk PRIMARY KEY (id);


--
-- Name: page_imported_member page_imported_member_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_imported_member
    ADD CONSTRAINT page_imported_member_pk PRIMARY KEY (id);


--
-- Name: page_member page_member_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_member
    ADD CONSTRAINT page_member_pk PRIMARY KEY (id);


--
-- Name: page page_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page
    ADD CONSTRAINT page_pk PRIMARY KEY (id);


--
-- Name: role role_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pk PRIMARY KEY (id);


--
-- Name: user_page user_page_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_page
    ADD CONSTRAINT user_page_pk UNIQUE (user_id, page_id);


--
-- Name: user user_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pk PRIMARY KEY (id);


--
-- Name: user_plan user_plan_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_plan
    ADD CONSTRAINT user_plan_pk PRIMARY KEY (user_id);


--
-- Name: order_user_id_uindex; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX order_user_id_uindex ON public."order" USING btree (user_id);


--
-- Name: user_plan_user_id_uindex; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_plan_user_id_uindex ON public.user_plan USING btree (user_id);


--
-- Name: compaign_member compaign_member_compaign_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compaign_member
    ADD CONSTRAINT compaign_member_compaign_id_fk FOREIGN KEY (compaign_id) REFERENCES public.compaign(id);


--
-- Name: compaign_member compaign_member_page_member_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compaign_member
    ADD CONSTRAINT compaign_member_page_member_id_fk FOREIGN KEY (page_member_id) REFERENCES public.page_member(id);


--
-- Name: compaign compaign_page_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compaign
    ADD CONSTRAINT compaign_page_id_fk FOREIGN KEY (page_id) REFERENCES public.page(id);


--
-- Name: compaign compaign_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compaign
    ADD CONSTRAINT compaign_user_id_fk FOREIGN KEY (creator_id) REFERENCES public."user"(id);


--
-- Name: order order_package_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_package_id_fk FOREIGN KEY (package_id) REFERENCES public.package(id);


--
-- Name: order order_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: page_imported_member page_imported_member_page_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_imported_member
    ADD CONSTRAINT page_imported_member_page_id_fk FOREIGN KEY (page_id) REFERENCES public.page(id);


--
-- Name: page_member page_member_page_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_member
    ADD CONSTRAINT page_member_page_id_fk FOREIGN KEY (page_id) REFERENCES public.page(id);


--
-- Name: user_page user_page_page_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_page
    ADD CONSTRAINT user_page_page_id_fk FOREIGN KEY (page_id) REFERENCES public.page(id);


--
-- Name: user_page user_page_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_page
    ADD CONSTRAINT user_page_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: user_plan user_plan_package_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_plan
    ADD CONSTRAINT user_plan_package_id_fk FOREIGN KEY (package_id) REFERENCES public.package(id);


--
-- Name: user_plan user_plan_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_plan
    ADD CONSTRAINT user_plan_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: user user_role_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_role_id_fk FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- PostgreSQL database dump complete
--

