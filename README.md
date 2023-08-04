# CodeRev

CodeRev is a lightweight tool to help you organize and conduct technical interviews using code reviews rather than leetcode.

## Rationale

In the age of StackOverflow and ChatGPT, is leetcode really the best way to evaluate technical candidates?

*Was it ever?*

Code review as interview has many benefits for any engineering team:

* Understand how candidates interact with isolated parts of your codebase.
* Better reflects day-to-day engineering responsibilities in your team.
* Realistic representation of how a candidate thinks and communicates.
* Open-ended and collaborative; no black and white responses.

## How it works

1. Create a workspace for each of the roles you're screening for.
2. Upload and edit your source files that you'd like the candidates to review.
3. Add candidates; each gets a separate view of the source to work on.
4. Candidates review the code in their workspace and provide comments and feedback.

## Benefits:

Why use CodeRev? Why not just a GitHub repo?

1. **Easy setup**: Lightweight, focused, and simple; just a few clicks to get started.
2. **Isolated**: No exposure of your internal GitHub repos, accounts, and workspaces.
3. **Collaborative**: Review candidate responses with your team and leave your own notes. (Coming soon)
4. **Easy to compare**: See feedback from different candidates to the same code to compare. (Coming soon)
5. **Define timed access**: Automatically release the workspace to your candidate and optionally revoke it. (Coming soon)

## FAQ:

* **Why did you make this tool?** I went through an interview where the process involved reviewing a snippet of code and really enjoyed the experience. I thought it would be great if there was a dedicated tool for this.
* **What's the stack** Nuxt3 (Vue.js) + Quasar Framework + Google Cloud Firebase. Productive, fast, and more or less free.

## Development

Development can be done locally using the Firebase CLI emulators.

1. Install the Firebase CLI tooling for your platform: https://firebase.google.com/docs/cli
2. Make a copy of `web/env.template` as `web/.env` and add your Firebase config.
3. Start the backend
4. Start the frontend

```
# Start the emulators in on console
cd web
yarn # Restore
yarn dev

# Start the backend
firebase emulators:start --only auth,firestore,functions,hosting,storage \
  --import .data/firebase --export-on-exit
```

## Deploying

You'll need a Firebase project to deploy:

```
# From web:
yarn generate     # This will generate the static routes.

# From the root:
firebase deploy

# Deploy only the hosting (making a front-end change):
firebase deploy --only hosting
```

> 💡 Note: Functions isn't necessary; I started the project thinking I may need it, but you can ignore it and remove it.  You won't be charged for it either way if you deploy it with functions.

## Using Functions Framework

Functions framework allows the SSR backend to run on the server.  However, this is currently not needed for CodeRev.

To enable, swap the `hosting` configuration:

```json
"source": "web",
"ignore": [
  "firebase.json",
  "**/.*",
  "**/node_modules/**"
],
"frameworksBackend": {
  "region": "us-central1"
}
```

## Setting up CORS for Storage

Storage requires that you set up CORS when using a custom domain.

Create the bucket `source.coderev.app` and then follow this guide: https://cloud.google.com/storage/docs/using-cors

Instead of doing it from the command line, you can use the Cloud Shell in console and open an editor in browser.

Create a file `cors.json`

```json
[
  {
    "origin": ["https://coderev.app"],
    "method": ["GET"],
    "responseHeader":[
        "Access-Control-Allow-Origin"
      ],
    "maxAgeSeconds": 3600
  }
]
```

From the console, run:

```
gcloud storage buckets update gs://source.coderev.app --cors-file=cors.json
```



