# Cinelingo 🎥

A web application aimed at providing another angle to language education by providing media suggestions to a learner of native content in their target language.

This was created as a BSc Computer Science final-year project.

Cinelingo is developed as a Svelte-based web SPA, using a hierarchical component architecture. Bulma CSS is used for simplifying the styling of some of the core features.

The central feature of this application is the content recommendation system that uses data from TMDb and IMDb to provide custom foreign cinema suggestions to users - this is done using the technique of generating numerical vector embeddings via sentence transformation.

The CRS is set up as a collection of cloud functions that could be redeployed to any FaaS/PaaS environment (with some configuration).

To reproduce the frontend of this app, clone this repo and run

```
npm install
```

To install its dependencies.

