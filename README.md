This tool is used to automatically get updates in your Discord server from specific Roblox technical categories.

By default these categories include several channels on the devforum:
- Announcements
- Release notes
- Developer indicident reports

It also includes one category on the Roblox blog post:
- Product & Tech

# Design
This system was designed to ensure a simple, non persistent way of keep track of the posts, this system can be hosted
completely standalone and does not require a database to operate, it only has to be able to run 24/7.

Because there's no database it cannot keep track of what has already been posted or not to your webhook.
This is why it's essential that it has to run 24/7, if something is posted whilst the system isn't running it
will never be able to post what you missed, keep that in mind.

# Extending
You are free to fork this repository for your own use and modify which categories you want to get updates about.
There's base command files which work both for the blog and the command allowing you to easily load any category
on either of those sites.

Entirely custom commands are also possible but you will have to scaffold the logic for loading the posts yourself.

# Running locally
If you want to test the system locally you will need to create a `.env.local` file and put the following inside of it:
```
DISCORD_WEBHOOKS=<your webhook url>
```
The system supports multiple webhooks separate by a comma.

There's three ways to run the program:
- `npm run single:test` runs the program one time using `.env.local` configuration values
- `npm run scheduler:test` runs the program on a scheduler using `.env.local` configuration values
- `npm run scheduler:prod` runs the program on a scheduler using the system environment

The first two can be used in a non-production environment, the last one should be used in production.
This way you can configure an environment variable in the machine you're running the program on and not have any
`.env` files overriding the configuration of the system.

# Hosting
As stated before all that is required is a 24/7 hosting availability. This is hosted for RSA by using a Heroku Dyno
running entirely on free dyno hours (creditcard required, no billing).

It doesn't matter where you want to host it as long as it supports hosting a Node.JS application.