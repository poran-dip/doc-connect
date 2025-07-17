# Doc Connect

**Doc Connect** was made for **Codestellation, 2025**, which is a hackathon organized as a part of **Udbhavanam**, a tech event held annually in **Assam Engineering College**.

This was also my first attempt at a full-fledged app, and I teamed up with [Parashar Deb](https://github.com/ParasharDeb) (ETE, AEC), [Dikshyan Chakraborty](https://github.com/Dikshyan) (CSE, ADTU), and Yashuwanta Bungurung, (ETE, AEC).

The original hackathon version is in the [`hackathon-legacy`](https://github.com/poran-dip/doc-connect/tree/hackathon-legacy) branch, but I recommend just cloning `main` as it has the same stuff as `project.zip`, without bloat like `node_modules/`, and has a proper dev script.

## Tech Stack

We originally planned to use the MERN stack, but ended up using HTML instead of React, so our complete stack:

- MongoDB
- Express
- Node.js
- HTML
- TypeScript
- JSONWebToken

This project is very incomplete and I do not plan on spending any more time developing it, but feel free to look explore if you want to have a peek at my dev journey. 

## Getting Started

Open your terminal, and run the following commands (one line at a time):

```bash
git clone https://github.com/poran-dip/doc-connect
cd doc-connect
npm install
npm run dev
```

Make sure you also have a MongoDB server running locally. By default, the app looks for a database named `doc_connect` running at `mongodb://127.0.0.1:27017/doc_connect`, but you can adjust that in [`src/database/db.ts`](/src/database/db.ts).

Run `npm run seed` if you want to populate your database with some dummy entries (check [`src/database/seed.ts`](/src/database/seed.ts) for the dummy credentials).

## Final Thoughts

If you feel inspired by this to make something of your own, by all means do so! I have included an MIT License if you ever end up making anything cool. 

That said, check out my repository [Eazydoc](https://github.com/poran-dip/eazy-doc) if you want to view an actually functional and polished version of this project. Eazydoc was made for the GDG On Campus Solution Challenge, 2025, where I and Dikshayn teamed up with Rajdeep and Hirok. Compared to Doc Connect, it's a full on glow-up!

Thanks again for checking this out! Keep building cool stuff, have a good day and peace!

— Poran Dip