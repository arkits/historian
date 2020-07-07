<h1 align="center">🕵️  Historian</h1>
<div align="center">
<em>Historian Never Forgets</em> <br>
<br> <br>
</div>

## About

Historian is a self-hosted full-stack app that gathers your all your data.

## Components

### Backend

Historian's Backend is made in -

-   Node.js
-   Typescript
-   Express
-   Typeorm + Postgres

Learn more - [src/backend](src/backend)

### Frontend

Historian's Frontend is made in -

-   Node.js
-   React.js

<img src="docs/images/timeline.png"></img>

Learn more - [src/frontend](src/frontend)

### Agents

Historian Agents are scripts or extensions that feed data to Historian.

Available Agents include:

#### Reddit Saved Posts

Learn more - [src/agents/reddit](src/agents/reddit)

#### Instagram Saved Posts

Learn more - [src/agents/instagram](src/agents/instagram)

#### Last.fm Scrobbles

Learn more - [src/agents/lastfm](src/agents/lastfm)

#### Make your own Agent!

You can make your own Agent with Historian's REST API. Refer to Swagger spec - [docs/historian-swagger.yml](docs/historian-swagger.yml)
