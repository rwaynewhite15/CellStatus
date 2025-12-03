CREATE TABLE "downtime_logs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"machine_id" varchar NOT NULL,
	"reason_code" text NOT NULL,
	"reason_category" text NOT NULL,
	"description" text,
	"start_time" text NOT NULL,
	"end_time" text,
	"duration" integer,
	"reported_by" text,
	"resolved_by" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_members" (
	"id" varchar PRIMARY KEY NOT NULL,
	"event_id" varchar NOT NULL,
	"operator_id" varchar NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_tasks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"event_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" text,
	"end_date" text,
	"status" text DEFAULT 'pending',
	"assignee_id" varchar,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" text,
	"end_date" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "machines" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"machine_id" text NOT NULL,
	"status" text NOT NULL,
	"operator_id" varchar,
	"units_produced" integer DEFAULT 0 NOT NULL,
	"target_units" integer DEFAULT 100 NOT NULL,
	"cycle_time" real,
	"efficiency" real,
	"last_updated" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"created_by" varchar,
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "maintenance_logs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"machine_id" varchar NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"scheduled_date" text,
	"completed_date" text,
	"technician" text,
	"notes" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"created_by" varchar,
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "operators" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"initials" text NOT NULL,
	"shift" text NOT NULL,
	"password" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_stats" (
	"id" varchar PRIMARY KEY NOT NULL,
	"machine_id" varchar NOT NULL,
	"shift" text NOT NULL,
	"date" text NOT NULL,
	"units_produced" integer NOT NULL,
	"target_units" integer NOT NULL,
	"downtime" integer DEFAULT 0,
	"efficiency" real,
	"created_at" text NOT NULL,
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");