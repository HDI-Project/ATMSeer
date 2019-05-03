export default function apiMiddleWare() {
    return (next: any) => (action: any) => {
        const {promise, types, ...params} = action;
        if(!promise) {
            return next(action);
        }
        const [REQUEST, SUCCESS, FAILURE] = types;
        next({...params, type: REQUEST});
        return promise.then(
            (result: any) => next({...params, result, type: SUCCESS}),
            (error: any) => next({...params, error, type: FAILURE})
        )
    }
}