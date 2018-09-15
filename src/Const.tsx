export const URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:7779'
    : location.origin;

export const UPDATE_INTERVAL_MS = 5000;
export const USER_STUDY = false;
// user_study == false , then user study related modules will be disabled.
// including, set name, post click event, early stoppings.

export const THRESHOLD_STEP : number = 20;
// after running 20 classifier, it will stop the datarun.