export default class View {
  constructor(el, store) {
    this._el = el;
    this._store = store;
    this._unsubscribe = store.subscribe(
      this._prepareRender.bind(this)
    );
    this._prepareRender();
  }

  _prepareRender() {
    this._el.innerHTML = this.render();
    }

  render() {
    throw new Error('This method should be overriden');
  }

  destroy() {
    this._el.innerHTML = '';
    this._unsubscribe();
  }
}