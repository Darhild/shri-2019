export function addFiles(data) {
  return {
    type: "ADD_FILES",
    files: data,
    all_files: data,
  }
}

export function showFiles(data) { 
  return {
    type: "SHOW_FILES",
    files: data
  }
}