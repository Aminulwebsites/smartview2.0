CREATE TABLE "food_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"category" text NOT NULL,
	"image" text NOT NULL,
	"is_veg" boolean DEFAULT true NOT NULL,
	"prep_time" text DEFAULT '15-20 mins' NOT NULL,
	"rating" numeric(2, 1) DEFAULT '4.0' NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"items" text NOT NULL,
	"total" integer NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"delivery_address" text NOT NULL,
	"payment_method" text NOT NULL,
	"customer_name" varchar,
	"customer_phone" varchar,
	"estimated_delivery_time" integer DEFAULT 35,
	"actual_delivery_time" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cuisine" text NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"delivery_time" text NOT NULL,
	"cost_for_two" integer NOT NULL,
	"delivery_fee" integer DEFAULT 0 NOT NULL,
	"image" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" varchar DEFAULT 'customer' NOT NULL,
	"phone" varchar,
	"profile_picture" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");