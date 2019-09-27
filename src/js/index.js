import Store from './lib/Store.js';
import reducer from './lib/reducer.js';
import { addFiles } from './actions/actions.js';
import ContentTable from './components/ContentTable.js';
import Search from './components/Search.js';
import initialData from './data-placeholder.js'; 

const store = new Store(reducer);
const search = new Search(
  document.querySelector('.Search'), store
);

console.log(search);

console.log(store);

const contentTable = new ContentTable(
  document.querySelector('.Comp-Content-table'), store
);

console.log(contentTable);

store.subscribe(search.render);
store.subscribe(contentTable.render);
store.dispatch(addFiles(initialData));
