import * as actionType from "./type";

export const userSelect = (uid) => {
  return {
    type: actionType.SELECT_USERS,
    payload: {
      selectUserId: uid,
    },
  };
};
