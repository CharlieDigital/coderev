# Generate to build static assets
yarn --cwd web generate

# Deploy hosting only.
firebase deploy --only hosting

