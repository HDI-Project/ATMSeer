export const URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3333'
    : location.origin;
// export const URL = '0.0.0.0:3333'