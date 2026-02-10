/**
 * Normalizes a search term by:
 * - Trimming whitespace
 * - Replacing special quote/dash characters with standard ones
 * - Normalizing "Saint"/"St." for common name searches
 */

export function normalizeTerm(term, searchType) {
  let normalized = (term || "").trim();
  normalized = normalized.replace(/[ʻ]/g, "");
  normalized = normalized.replace(/[’‘ʼ]/g, "'");
  normalized = normalized.replace(/[–—‑]/g, "-");
  normalized = normalized.replace(/\s+/g, " ");

  if (searchType === "common") {
    normalized = normalized.replace(/\bsaint\b\.?/gi, "St.");
    normalized = normalized.replace(/\bst\b\.?/gi, "St.");
  }

  return normalized;
}

/**
 * Validates a search term based on search type.
 * Returns an error message string if invalid, or null if valid.
 */

export function validateTerm(term, searchType) {
  if (!term) {
    if (
      searchType === "common" ||
      searchType === "genus" ||
      searchType === "species"
    ) {
      return "Search term cannot be empty.";
    }
    return null;
  }

  if (searchType === "genus") {
    if (!/^[A-Za-z]+$/.test(term)) {
      return "Genus must contain only letters A-Z (no spaces or punctuation).";
    }
    return null;
  }

  if (searchType === "species") {
    if (!/^[A-Za-z]+( [A-Za-z]+)?$/.test(term)) {
      return "Species must be one or two words using only letters A-Z (e.g. 'subbuteo' or 'Falco subbuteo').";
    }
    return null;
  }

  if (searchType === "common") {
    if (!/^[\p{L}\p{M} .\-']+$/u.test(term)) {
      return "Search contains invalid characters. Allowed special characters are: -, ', .";
    }
  }

  return null;
}
