CREATE TABLE "email_codes" (
	"email" text NOT NULL,
	"purpose" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_codes_email_purpose_pk" PRIMARY KEY("email","purpose")
);
--> statement-breakpoint
CREATE TABLE "oauth_flows" (
	"state_hash" text PRIMARY KEY NOT NULL,
	"purpose" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"code_verifier" text NOT NULL,
	"nonce" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"google_sub" text,
	"permissions" integer DEFAULT 0 NOT NULL,
	"name" text,
	"picture_url" text,
	"grade" integer,
	"class" integer,
	"gender" text,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_sub_unique" UNIQUE("google_sub"),
	CONSTRAINT "users_permissions_range" CHECK ("users"."permissions" BETWEEN 0 AND 7),
	CONSTRAINT "users_grade_range" CHECK ("users"."grade" BETWEEN 1 AND 3 OR "users"."grade" IS NULL),
	CONSTRAINT "users_class_range" CHECK ("users"."class" BETWEEN 1 AND 6 OR "users"."class" IS NULL),
	CONSTRAINT "users_class_requires_grade" CHECK ("users"."class" IS NULL OR "users"."grade" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_codes_expires_at_idx" ON "email_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "oauth_flows_expires_at_idx" ON "oauth_flows" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");