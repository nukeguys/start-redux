import * as types from './ActionTypes';

export const increment = () => ({
  type: types.INCREMENT,
});

export const decerment = () => ({
  type: types.DECREMENT,
});

export const setColor = color => ({
  type: types.SET_COLOR,
  color,
});
