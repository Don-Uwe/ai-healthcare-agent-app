This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Project structure

    .
    ├── src                         # Source files (alternatively `lib` or `app`)
    │   ├── component               # Common components, as pure as possible, if component too complex, create a directory
    │   ├── config                  # Project common settings, e.g. wallet support chain
    │   ├── icons                   # Image files
    │   ├── hooks                   # Project common hooks, don't put zustand store or feature usage only hook here
    │   ├── pages                   # Entry page of each feature, ONLY write initial data fetching or zustand actions dispatch
    │   ├── features                # Project page files, separate by domain
    │   │   ├── Swap
    │   │   │   ├── index.tsx       # Main page of each feature
    │   │   │   ├── useXXStore.ts   # Feature use ONLY zustand store, for sharing store, put in src/store
    │   │   │   ├── util.ts         # Feature use ONLY util, for sharing, put in src/util
    │   │   │   └── components
    │   │   └── ....(other feature pages, e.g. farm, pool)
    │   ├── store                   # Sharing zustand store, use store/createStore to create a new store for easier debugging
    │   ├── provider                # Common providers, usually wrap App component in pages/_app.tsx file
    │   └── util                    # Common utility functions
    └── README.md

### Coding rules

1. Zustand store should define actions(function) and state in initialization
2. Use zustand action to call api or async operations as possible, DO NOT wrapped it in every hooks
3. Common components should be as pure as possible, reduce side effects if wants to add features, add new props to control it
4. Components in src/features/xxx/components should also be as pure as possible, let index.tsx pass functions and props into it (prevent business logic separate in everywhere

### Components Map

- [`<TokenAvatar>`](./src/components/TokenAvatar.tsx) extends Chakra's `<Avatar>`, for avatar may be clickable/linkable in future, write this manually everytime is too complicated
  - `prop:token` coin's SplToken
- [`<TokenSymbol>`](./src/components/TokenSymbol.tsx) extends Chakra's `<Text>`, for text may have tooltip in future, write this manually everytime is too complicated
  - `prop:token` coin's SplToken
- [`<Button>`](./src/components/Button.tsx) extends Chakra's `<Button>`
  - `prop:validators` handle app easy to see validation conditions
- [`<ChartPanel>`](./src/components/ChartPanel.tsx) styled chart
- [`<MessageBox>`](./src/components/MessageBox.tsx) simple message display
  - `prop:title` message title
  - `prop:status` message level, current support: warning | error | info, default is info
  - `prop:icon` icon beside title
  - `prop:children` for message more than a simple string, you could wrap them as children
- [`<MessageStrip>`](./src/components/MessageStrip.tsx) message display
  - `prop:title` message title
  - `prop:desc` message description
  - `prop:status` message level, current support: info | warning
  - `prop:icon` icon beside title
  - `prop:children` for more detail about message information, you could wrap them as children
  - `prop:renderControlAction` extra interactive/action relative to message

### hooks Map

- [`useIsomorphicLayoutEffect()`](./src/hooks/useIsomorphicLayoutEffect.ts) useLayoutEffect()'s SSR version. Avoid bug report in CMD(name is conventional)
- [`useEvent()`](./src/hooks/useEvent.ts) make function dependence always update but function address never change(it hook is suggested by Dan Abramov)
- [`useSearch()`](./src/utils/searchItems.ts) a wrapper of [searchItems](./src/utils/searchItems.ts)
- [`useToast()`](./src/hooks/useToast.tsx) a wrapper of chakra toast w/ Raydium style

### utils Map

- [`searchItems()`](./src/utils/searchItems.ts) apply search logic, it will only sort the result by match condition (TODO: support sort factor)
