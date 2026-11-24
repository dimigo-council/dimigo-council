CREATE TABLE "requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ip" text NOT NULL,
	"user_agent" text,
	"req_method" text NOT NULL,
	"origin_url" text NOT NULL,
	"http_version" text NOT NULL,
	"status_code" integer NOT NULL,
	"authorization" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration_ms" integer NOT NULL
);
