// Shared production backend — same database used by https://mjdemo.vsmartengine.com
// (website + admin panel). Media uploaded via the admin panel will show up here,
// and anything fetched/posted by this app hits the same data.
const String baseUrl = 'https://mjdemo.vsmartengine.com/api/v2';

// For local development against your own machine's backend, use instead:
// const String baseUrl = 'http://172.20.10.2:3000/api/v2';