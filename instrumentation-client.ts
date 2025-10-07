// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { isProductionEnvironment } from './src/config';

if (isProductionEnvironment()) {
  console.log("Initializing Sentry for client-side instrumentation...");
  // This is the DSN (Data Source Name) for your Sentry project.

  Sentry.init({
  // ! No pasa nada si está el dsn hardcodeado
  dsn: "https://4cd8e30685d21d3397d463c633ec0c5b@o4508667613151232.ingest.us.sentry.io/4509050447855616",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
}
