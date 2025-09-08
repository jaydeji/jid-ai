import path from 'node:path'
import fs from 'node:fs/promises'
import { marked } from 'marked'

const readFile = async (filePath) => {
  const file = path.resolve(process.cwd(), filePath)
  return await fs.readFile(file, 'utf8')
}

readFile('scripts/text.md').then((e) => {
  console.log(marked.lexer(e))
})
