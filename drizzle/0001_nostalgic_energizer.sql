ALTER TABLE "history" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "history" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "history" ALTER COLUMN "timelineTime" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT now() NOT NULL;