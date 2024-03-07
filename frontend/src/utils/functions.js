
/*
 * Function to get the current date in the format YYYY-MM-DD
*/
export const maxInputDate = () =>
  new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
