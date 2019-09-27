/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
import View from './../lib/View.js';
import { showFiles } from './../actions/actions.js';

export default class Search extends View {
  constructor(el, store) {
    super(el, store);    

    this.searchValue = '';
    this._prepareRender();
    this.bindEvents();
  }

  _onSubmit() {    
    const filteredData = this.filterStore(this.searchValue);
    this._store.dispatch(showFiles(filteredData));
  }
  
  filterStore(value) {
    return this._store._state.all_files.filter((file) => this.searchInStore(file.name, value));
  }

  searchInStore(name, value) {
    const reg = new RegExp(`${value}`, 'i');
    return name.match(reg); 
  }
  
  bindEvents() {
    this._el.addEventListener('input', (event) => {      
      this.searchValue = event.target.value;      
    });

    this._el.addEventListener('submit', (event) => {
      event.preventDefault();
      this._onSubmit(event);
    });    
  }  

  render() {
    return `
      <form class="Search-Form"> 
        <input class="Search-Input Main-header-Search-input" type="text">
        <input class="Btn Search-Submit" type="submit" value="">
        </input>
      </form>`;
  }
}