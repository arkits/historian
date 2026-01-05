CREATE TABLE "api_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUsedAt" timestamp,
	"expiresAt" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	CONSTRAINT "api_key_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;