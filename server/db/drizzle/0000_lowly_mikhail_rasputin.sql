CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"securityQuestionOne" text NOT NULL,
	"securityAnswerOne" text NOT NULL,
	"securityQuestionTwo" text NOT NULL,
	"securityAnswerTwo" text NOT NULL,
	"securityCode" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
