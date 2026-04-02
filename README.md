# WebSSH

## Use locally

Simply clone the project:

```bash
git clone https://github.com/238728/WebSSH.git
cd WebSSH
```

Then run: 

```bash
npm install
npm run build:start
```

And then visit [https://localhost:3000](https://localhost:3000) in your broswer to use the app.

## Use on the web

This project requires `socket.io` as its dependency, which doesn't work in static site generators.

One choice is to use a `Dockerfile` and deploy the backend to a server function site (e.g. Render, Railway, Zeabur, etc.), but the backend repo is still under work. Check back later.
