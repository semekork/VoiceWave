/**
 * Fetches public holidays for a given year and country code from Nager.Date API
 * @param {number} year - The year to fetch holidays for (e.g., 2025)
 * @param {string} countryCode - ISO 3166 country code (e.g., 'GH' for Ghana)
 * @returns {Promise<Array>} - Array of holiday objects { date, name, localName }
 */

export const fetchHolidays = async (year, countryCode = 'GH') => {
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    if (!response.ok) throw new Error(`Failed to fetch holidays: ${response.statusText}`);
    return await response.json(); // Array of holidays
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};
