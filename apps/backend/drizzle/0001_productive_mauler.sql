CREATE TABLE "activities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "activities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT '검토 중' NOT NULL,
	"scope" text DEFAULT '학생회' NOT NULL,
	"department_id" integer,
	"owner_id" uuid,
	"created_by_id" uuid,
	"plan" jsonb,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_status" CHECK ("activities"."status" IN ('검토 중', '추진 중', '완료', '보류')),
	CONSTRAINT "activities_scope" CHECK ("activities"."scope" IN ('전체 공개', '학생회'))
);
--> statement-breakpoint
CREATE TABLE "activity_drafts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_histories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "activity_histories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"activity_id" integer NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"at" timestamp with time zone,
	"link_label" text,
	"link_url" text,
	"task_id" integer,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_histories_kind" CHECK ("activity_histories"."kind" IN ('질의', '회의', '협의', '추진', '보고')),
	CONSTRAINT "activity_histories_link_pair" CHECK (("activity_histories"."link_label" IS NULL) = ("activity_histories"."link_url" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "department_members" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"department_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"position" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "department_members_role" CHECK ("department_members"."role" IN ('member', 'head'))
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "departments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inquiries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"body" text NOT NULL,
	"scope" text NOT NULL,
	"anonymous" boolean DEFAULT false NOT NULL,
	"author_id" uuid NOT NULL,
	"status" text DEFAULT '접수' NOT NULL,
	"department_id" integer,
	"answer_body" text,
	"answer_department_id" integer,
	"answered_at" timestamp with time zone,
	"reject_reason" text,
	"rejected_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"activity_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inquiries_status" CHECK ("inquiries"."status" IN ('접수', '답변 완료', '처리 완료', '반려')),
	CONSTRAINT "inquiries_scope" CHECK ("inquiries"."scope" IN ('전체 공개', '학생회만')),
	CONSTRAINT "inquiries_body_length" CHECK (char_length("inquiries"."body") <= 1000),
	CONSTRAINT "inquiries_anonymous_requires_public" CHECK (NOT "inquiries"."anonymous" OR "inquiries"."scope" = '전체 공개')
);
--> statement-breakpoint
CREATE TABLE "inquiry_likes" (
	"inquiry_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "inquiry_likes_inquiry_id_user_id_pk" PRIMARY KEY("inquiry_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "survey_participants" (
	"survey_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "survey_participants_survey_id_user_id_pk" PRIMARY KEY("survey_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"grade" integer,
	"class_number" integer,
	"duration_seconds" integer,
	"excluded" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "surveys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text DEFAULT '' NOT NULL,
	"intro" text DEFAULT '' NOT NULL,
	"activity_id" integer,
	"department_id" integer,
	"owner_id" uuid,
	"grades" integer[] DEFAULT '{1,2,3}' NOT NULL,
	"collects_class" boolean DEFAULT false NOT NULL,
	"questions" jsonb NOT NULL,
	"stage" text DEFAULT 'draft' NOT NULL,
	"opens_at" timestamp with time zone,
	"closes_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"review_requested" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "surveys_stage" CHECK ("surveys"."stage" IN ('draft', 'published')),
	CONSTRAINT "surveys_grades" CHECK (cardinality("surveys"."grades") > 0 AND "surveys"."grades" <@ ARRAY[1, 2, 3]),
	CONSTRAINT "surveys_published_fields" CHECK ("surveys"."stage" = 'draft' OR ("surveys"."activity_id" IS NOT NULL AND "surveys"."opens_at" IS NOT NULL AND "surveys"."closes_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "task_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" integer NOT NULL,
	"kind" text NOT NULL,
	"text" text NOT NULL,
	"status" text,
	"created_by_id" uuid,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_logs_kind" CHECK ("task_logs"."kind" IN ('배정', '진행 중', '수정', '완료')),
	CONSTRAINT "task_logs_status" CHECK ("task_logs"."status" IS NULL OR "task_logs"."status" IN ('예정됨', '진행 중', '검토 요청', '완료'))
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"tag" text,
	"activity_id" integer,
	"assigner_id" uuid,
	"department_id" integer,
	"assignee_id" uuid,
	"start_at" date NOT NULL,
	"due_at" date NOT NULL,
	"status" text DEFAULT '예정됨' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_status" CHECK ("tasks"."status" IN ('예정됨', '진행 중', '검토 요청', '완료')),
	CONSTRAINT "tasks_due_after_start" CHECK ("tasks"."due_at" >= "tasks"."start_at")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_drafts" ADD CONSTRAINT "activity_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_histories" ADD CONSTRAINT "activity_histories_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_histories" ADD CONSTRAINT "activity_histories_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_histories" ADD CONSTRAINT "activity_histories_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_answer_department_id_departments_id_fk" FOREIGN KEY ("answer_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_likes" ADD CONSTRAINT "inquiry_likes_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry_likes" ADD CONSTRAINT "inquiry_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_participants" ADD CONSTRAINT "survey_participants_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_participants" ADD CONSTRAINT "survey_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_logs" ADD CONSTRAINT "task_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_logs" ADD CONSTRAINT "task_logs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigner_id_users_id_fk" FOREIGN KEY ("assigner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_histories_activity_idx" ON "activity_histories" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "department_members_department_idx" ON "department_members" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "inquiries_author_idx" ON "inquiries" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "inquiries_activity_idx" ON "inquiries" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "survey_responses_survey_idx" ON "survey_responses" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "task_logs_task_idx" ON "task_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "tasks_activity_idx" ON "tasks" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "tasks_assignee_idx" ON "tasks" USING btree ("assignee_id");