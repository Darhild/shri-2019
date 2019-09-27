export default function reducer(state, action) {
  switch (action.type) {
    case 'ADD_FILES':
      return  { 
                files: action.files,
                all_files: action.files,
              };

    case 'SHOW_FILES':
      return  { 
                ...state,
                files: action.files,
              };
    
    default:
      return state;
  }
}