--
-- PostgreSQL database dump
--

\restrict p2g1oMDRBzdErMzcnz3ai8ghDe9MGryH6iE9cggHlbcuHpeCPnBflyCh03v0Fhj

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    role_title character varying(255) DEFAULT 'Unknown Role'::character varying NOT NULL,
    status character varying(50) DEFAULT 'applied'::character varying NOT NULL,
    applied_date date DEFAULT CURRENT_DATE CONSTRAINT applications_applied_data_not_null NOT NULL,
    notes text,
    gmail_message_id text,
    link text NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: gmail_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gmail_tokens (
    id integer NOT NULL,
    user_account character varying(255) NOT NULL,
    refresh_token text NOT NULL,
    profile_picture text,
    user_id bigint NOT NULL
);


--
-- Name: gmail_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gmail_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gmail_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gmail_tokens_id_seq OWNED BY public.gmail_tokens.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: gmail_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_tokens ALTER COLUMN id SET DEFAULT nextval('public.gmail_tokens_id_seq'::regclass);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: applications applications_user_gmail_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_gmail_key UNIQUE (user_id, gmail_message_id);


--
-- Name: gmail_tokens gmail_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_tokens
    ADD CONSTRAINT gmail_tokens_pkey PRIMARY KEY (id);


--
-- Name: gmail_tokens gmail_tokens_user_account_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_tokens
    ADD CONSTRAINT gmail_tokens_user_account_key UNIQUE (user_account);


--
-- Name: gmail_tokens gmail_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_tokens
    ADD CONSTRAINT gmail_tokens_user_id_key UNIQUE (user_id);


--
-- Name: sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: applications_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_user_id_idx ON public.applications USING btree (user_id);


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: gmail_tokens gmail_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gmail_tokens
    ADD CONSTRAINT gmail_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict p2g1oMDRBzdErMzcnz3ai8ghDe9MGryH6iE9cggHlbcuHpeCPnBflyCh03v0Fhj

