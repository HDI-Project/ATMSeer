export const URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:7777'
    : 'location.origin'

export const UPDATE_INTERVAL_MS = 500;