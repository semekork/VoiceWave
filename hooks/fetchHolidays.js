/**
 * Fetches public holidays for a given year and country code from Nager.Date API
 * @param {number} year - The year to fetch holidays for (e.g., 2025)
 * @param {string} countryCode - ISO 3166 country code (e.g., 'GH' for Ghana)
 * @returns {Promise<Array>} - Array of holiday objects { date, name, localName }
 */

export const fetchHolidays = async (year, countryCode = 'GH') => {
  try {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;

    const response = await fetch(url);


    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }


    if (!responseText || responseText.trim().length === 0) {
      console.warn('Empty response received from holidays API');
      return [];
    }

    try {
      const data = JSON.parse(responseText);

      return Array.isArray(data) ? data : [];
    } catch (parseError) {

      return [];
    }

  } catch (error) {


    if (error.name === 'TypeError' && error.message.includes('fetch')) {

    }

    return [];
  }
};

/**
 * Check if the Nager.Date API supports a given country code
 * @param {string} countryCode - ISO 3166 country code
 * @returns {Promise<boolean>} - Whether the country is supported
 */
export const isCountrySupported = async (countryCode) => {
  try {
    const response = await fetch('https://date.nager.at/api/v3/AvailableCountries');
    if (!response.ok) return false;
    
    const countries = await response.json();
    return countries.some(country => country.countryCode === countryCode.toUpperCase());
  } catch (error) {

    return false;
  }
};

/**
 * Enhanced fetch holidays with country validation
 * @param {number} year - The year to fetch holidays for
 * @param {string} countryCode - ISO 3166 country code
 * @returns {Promise<Array>} - Array of holiday objects
 */
export const fetchHolidaysWithValidation = async (year, countryCode = 'GH') => {

  const supported = await isCountrySupported(countryCode);
  if (!supported) {
  }

  return fetchHolidays(year, countryCode);
};