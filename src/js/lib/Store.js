/* eslint-disable no-underscore-dangle */
export default class Store {
  constructor(reducer) {
    this._reducer = reducer;
    this._state = undefined;
    this._listeners = [];
    this.dispatch({
      type: 'INIT',
    });
  }

  getState() {
    return this._state;
  }

  subscribe(cb) {
    this._listeners.push(cb);
    return () => {
      const index = this._listeners.indexOf(cb);
      this._listeners.splice(index, 1);
    };
  }

  dispatch(action) {
    this._state = this._reducer(this._state, action);
    this._notifyListeners();
  }

  _notifyListeners() {
    this._listeners.forEach((listener) => {
      listener(this._state);
    });
  }
}
