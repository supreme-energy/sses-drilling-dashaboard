# SSES Drilling Dashboard

## Uprading React-Powertools
 - get the latest powertools build from https://build-artifacts.experolabs.com/react-powertools/index.html#
 - add the latest .tgz file to the repo
 - run `yarn remove react-powertools` to remove the old dependency
 - run `yarn add ./react-powertools-v1.x.x.tgz` to add the new
 - `git rm` to remove the old .tgz file
 - open a PR


##

## Table of Contents
1. [Requirements](#requirements)
1. [Installation](#getting-started)
1. [Running the Project](#running-the-project)
1. [Project Structure](#project-structure)
1. [Live Development](#local-development)
    * [Hot Reloading](#hot-reloading)
    * [Redux DevTools](#redux-devtools)
1. [Routing](#routing)
1. [Testing](#testing)
    * [dirty-chai](#dirty-chai)
1. [Building for Production](#building-for-production)
1. [Deployment](#deployment)
1. [Thank You](#thank-you)

## Requirements
* node `^5.0.0`
* yarn `^0.23.0` or npm `^3.0.0`

## Installation

Next install the project dependencies. It is recommended that you use [Yarn](https://yarnpkg.com/) for deterministic dependency management, but `npm install` will suffice.

```bash
$ yarn  # Install project dependencies (or `npm install`)
```

## Running the Project

After completing the [installation](#installation) step, you're ready to start the project!

```bash
$ yarn start  # Start the development server (or `npm start`)
```

While developing, you will probably rely mostly on `yarn start`; however, there are additional scripts at your disposal:

|`yarn <script>`    |Description|
|-------------------|-----------|
|`start`            |Serves your app at `localhost:3000`|
|`build`            |Builds the application to ./dist|
|`test`             |Runs unit tests with Karma. See [testing](#testing)|
|`test:watch`       |Runs `test` in watch mode to re-run tests when changed|
|`lint`             |[Lints](http://stackoverflow.com/questions/8503559/what-is-linting) the project for potential errors|
|`lint:fix`         |Lints the project and [fixes all correctable errors](http://eslint.org/docs/user-guide/command-line-interface.html#fix)|

## Project Structure

The project structure presented in this boilerplate is **fractal**, where functionality is grouped primarily by feature rather than file type. This structure is only meant to serve as a guide, it is by no means prescriptive. That said, it aims to represent generally accepted guidelines and patterns for building scalable applications. If you wish to read more about this pattern, please check out this [awesome writeup](https://github.com/davezuko/react-redux-starter-kit/wiki/Fractal-Project-Structure) by [Justin Greenberg](https://github.com/justingreenberg).

```
.
├── build                    # All build-related code
├── public                   # Static public assets (not imported anywhere in source code)
├── server                   # Express application that provides webpack middleware
│   └── main.js              # Server application entry point
├── src                      # Application source code
│   ├── index.html           # Main HTML page container for app
│   ├── main.js              # Application bootstrap and rendering
│   ├── normalize.js         # Browser normalization and polyfills
│   ├── components           # Global Reusable Components
│   ├── containers           # Global Reusable Container Components
│   ├── layouts              # Components that dictate major page structure
│   │   └── PageLayout       # Global application layout in which to render routes
│   ├── routes               # Main route definitions and async split points
│   │   ├── index.js         # Bootstrap main application routes with store
│   │   ├── Home             # Fractal route
│   │   │   ├── index.js     # Route definitions and async split points
│   │   │   ├── assets       # Assets required to render components
│   │   │   ├── components   # Presentational React Components
│   │   │   └── routes **    # Fractal sub-routes (** optional)
│   │   └── Counter          # Fractal route
│   │       ├── index.js     # Counter route definition
│   │       ├── container    # Connect components to actions and store
│   │       ├── modules      # Collections of reducers/constants/actions
│   │       └── routes **    # Fractal sub-routes (** optional)
│   ├── store                # Redux-specific pieces
│   │   ├── createStore.js   # Create and instrument redux store
│   │   └── reducers.js      # Reducer registry and injection
│   └── styles               # Application-wide styles (generally settings)
└── tests                    # Unit tests
```

## Live Development

### Hot Reloading

Hot reloading is enabled by default when the application is running in development mode (`yarn start`). This feature is implemented with webpack's [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement.html) capabilities, where code updates can be injected to the application while it's running, no full reload required. Here's how it works:

* For **JavaScript** modules, a code change will trigger the application to re-render from the top of the tree. **Global state is preserved (i.e. redux), but any local component state is reset**. This differs from React Hot Loader, but we've found that performing a full re-render helps avoid subtle bugs caused by RHL patching.

* For **Sass**, any change will update the styles in realtime, no additional configuration or reload needed.

### Redux DevTools

**We recommend using the [Redux DevTools Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd).**
Using the chrome extension allows your monitors to run on a separate thread and affords better performance and functionality. It comes with several of the most popular monitors, is easy to configure, filters actions, and doesn't require installing any packages in your project.

However, it's easy to bundle these developer tools locally should you choose to do so. First, grab the packages from npm:

```bash
yarn add --dev redux-devtools redux-devtools-log-monitor redux-devtools-dock-monitor
```

Then follow the [manual integration walkthrough](https://github.com/gaearon/redux-devtools/blob/master/docs/Walkthrough.md).

## Routing
We use `react-router` [route definitions](https://github.com/ReactTraining/react-router/blob/v3/docs/API.md#plainroute) (`<route>/index.js`) to define units of logic within our application. See the [project structure](#project-structure) section for more information.

## Testing
To add a unit test, create a `.test.js` file anywhere inside of `./tests`. Jest is currently configured to find these files. Here are a few important plugins and packages available to you during testing:

### dirty-chai

Some of the assertions available from [chai](chaijs.com) use [magical getters](http://chaijs.com/api/bdd/#method_true). These are problematic for a few reasons:

1) If you mistype a property name (e.g. `expect(false).to.be.tru`) then the expression evaluates to undefined, the magical getter on the `true` is never run, and so your test silently passes.
2) By default, linters don't understand them and therefore mark them as unused expressions, which can be annoying.

[Dirty Chai](https://github.com/prodatakey/dirty-chai) fixes this by converting these getters into callable functions. This way, if mistype an assertion, our attempt to invoke it will throw due to the property being undefined.

```js
// This silently passes because the getter on `true` is never invoked!
it('should be true', () => {
  expect(false).to.be.tru // evalutes to undefined :(
})

// Much better! Our assertion is invalid, so it throws rather than implicitly passing.
it('should be true', () => {
  expect(false).to.be.tru() // `tru` is not defined!
})
```

## Building for Production

## Deployment

Out of the box, this starter kit is deployable by serving the `./dist` folder generated by `yarn build`. This project does not concern itself with the details of server-side rendering or API structure, since that demands a more opinionated structure that makes it difficult to extend the starter kit. The simplest deployment strategy is a [static deployment](#static-deployments).

### Static Deployments

Serve the application with a web server such as nginx by pointing it at your `./dist` folder. Make sure to direct incoming route requests to the root `./dist/index.html` file so that the client application will be loaded; react-router will take care of the rest. If you are unsure of how to do this, you might find [this documentation](https://github.com/reactjs/react-router/blob/master/docs/guides/Histories.md#configuring-your-server) helpful. The Express server that comes with the starter kit is able to be extended to serve as an API and more, but is not required for a static deployment.
