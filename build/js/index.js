import Store from './lib/Store.js';
import reducer from './lib/reducer.js';
import ContentTable from './components/ContentTable.js';

const store = new Store(reducer);

const content = new ContentTable(
  document.querySelector('.Comp-Content-table'), store
);