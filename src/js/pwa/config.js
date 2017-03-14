/*
  service worker
*/

// configuration
`use strict`;

const
  version = '/* @echo version */',
  CACHE = version + '/* @echo PWAcache */',
  offlineURL = '/* @echo offlineURL */',
  installFilesEssential = [
    '/',
    '/manifest.json',
    '/css/main.css',
    '/js/main.js',
    '/js/offlinepage.js'
  ].concat(offlineURL),
  installFilesDesirable = [
  ];
