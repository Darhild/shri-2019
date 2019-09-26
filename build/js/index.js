import Store from './lib/Store.js';
import ContentTable from './components/ContentTable.js';

const store = new Store(() => {});

const content = new ContentTable(
  document.querySelector('.Comp-Content-table'), store
);