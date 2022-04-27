import * as actionType from "../actions/type";
import { combineReducers } from "redux";

const intialize = {
  uid: null,
  name: null,
  photo: null,
  block: null,
  id: null,
  loading: true,
};

const selectUserReducer = (state = intialize, action) => {
  switch (action.type) {
    case actionType.SELECT_USERS:
      return {
        uid: action.payload.uid,
        name: action.payload.name,
        photo: action.payload.photo,
        block: action.payload.block,
        id: action.payload.id,
        loading: false,
      };
    default:
      return state;
  }
};

export const rootReducer = combineReducers({
  userSelection: selectUserReducer,
});
