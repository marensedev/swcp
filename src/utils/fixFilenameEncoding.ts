// Fix the encoding of filenames
export default (filename: string) => {
    return Buffer.from(filename, "latin1").toString("utf8")
}
