export const URL = process.env.NODE_ENV === 'development'
    ? 'http://atmapi.hkustvis.org'
    : 'location.origin'

export const UPDATE_INTERVAL_MS = 5000;