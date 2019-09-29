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

const contentTable = new ContentTable(
  document.querySelector('.Comp-Content-table'), store
);

store.dispatch(addFiles(initialData));
/*
fetch('http://localhost:8000/api/repos/yeticave/files')
.then((data) => data.json())
.then((files) => store.dispatch(addFiles(files)))
*/

