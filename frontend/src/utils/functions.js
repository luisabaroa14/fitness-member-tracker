/*
 * Function to get the current date in the format YYYY-MM-DD
 */
export const maxInputDate = () =>
  new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

/*
 * Function to format the date and time in the specified format.
 * @param {Date} date - The date object to be formatted.
 * @returns {string} - Formatted date and time string.
 */
export const formatDate = (date) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }
  return new Date(date).toLocaleDateString('en-US', options)
}
