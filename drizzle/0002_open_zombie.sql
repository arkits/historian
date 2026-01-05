CREATE TABLE "history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"timelineTime" timestamp NOT NULL,
	"type" text NOT NULL,
	"contentId" text NOT NULL,
	"content" jsonb NOT NULL,
	"searchContent" text,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "History_hash" ON "history" ("contentId", "userId", "type", "timelineTime");
--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;