// Removes the root folder from a path
export default (filename: string) => {
    return filename.split("/").slice(1).join("/")
}
