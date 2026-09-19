import { authorsById } from "./blogMetadata";

export function getAuthor(authorId) {
  return authorsById[authorId] || authorsById[1];
}

export default authorsById;