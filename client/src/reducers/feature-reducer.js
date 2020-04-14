const initialState = {
    features: [],
    status: "idle",
}

export default function featureReducer( state = initialState, action ){
    switch(action.type) {
        case "REQUEST_FEATURE_PRODUCTS": {
            return {
                ...state,
                status: "loading",
            };
        }
        case "RECEIVE_FEATURE_PRODUCTS": {
            return {
                ...state,
                features: action.features,
                status: "idle",
            }
        }
        case "RECEIVE_FEATURE_PRODUCTS_ERROR": {
            return {
                ...state,
                status: "error",
            }
        }
        default:{
            return state;
        }
    }
}