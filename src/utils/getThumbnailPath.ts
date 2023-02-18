import path from "path"

export const thumbnailsFolderPath = path.join(
    __dirname,
    "..",
    "..",
    "thumbnail"
)

function getThumbnailPaths(contentId: string): string[] {
    return [
        path.join(thumbnailsFolderPath, `${contentId}.jpg`),
        path.join(thumbnailsFolderPath, `${contentId}.png`),
    ]
}

export default getThumbnailPaths
