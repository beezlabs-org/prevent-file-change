export async function isTrustedAuthor(pullRequestAuthor: string, trustedAuthors: string): Promise<boolean> {
  if (!trustedAuthors) {
    return false
  }
  const authors = trustedAuthors.split(',').map(author => author.trim())
  return authors.includes(pullRequestAuthor)
}
