/**
 * Simple helper to slugify strings.
 * Converts to lowercase, trims whitespace, removes non-alphanumeric chars,
 * and replaces spaces/multiple hyphens with a single hyphen.
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except -
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Generates a unique slug inside a Mongoose collection.
 * Appends an incrementing counter if a duplicate slug is found.
 */
export const getUniqueSlug = async (Model, name, excludeId = null) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await Model.findOne(query);
    if (!existing) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};
