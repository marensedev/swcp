import { randomUUID } from "crypto"
import express from "express"
import multer from "multer"
import os from "os"
import path from "path"
import fs from "@supercharge/fs"
import fixFilenameEncoding from "./utils/fixFilenameEncoding"
import removeRootFolder from "./utils/removeRootFolder"
import contentRouter from "./api/content"

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(contentRouter)

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000")
})
