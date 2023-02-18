import path from "path"

export const contentsFolderPath = path.join(__dirname, "..", "..", "content")

function getContentPath(contentId: string): string {
    return path.join(contentsFolderPath, contentId)
}

export default getContentPath
