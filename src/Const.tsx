export const URL = process.env.NODE_ENV === 'development'
    ? 'http://0.0.0.0:3333'
    : 'location.origin'

export const UPDATE_INTERVAL_MS = 5000;