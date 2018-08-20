export const URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3333'
    : 'location.origin'

export const UPDATE_INTERVAL_MS = 5000;