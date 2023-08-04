import { customAlphabet } from 'nanoid'
import { alphanumeric } from 'nanoid-dictionary'

/**
 * Creates an alphanumeric ID string using the specified number of characters.
 * The default is to create an ID of 8 characters if no length is specified.
 * @param size An optional integer which defines the size of the ID string.
 */
export const nanoid = (size?: number | undefined): string => {
  const characterCount = size ?? 16
  return customAlphabet(alphanumeric, characterCount)()
}
