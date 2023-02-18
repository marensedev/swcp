import { PrismaClient } from "@prisma/client"
import express from "express"
import asyncHandler from "express-async-handler"
import * as yup from "yup"
import fs from "@supercharge/fs"
import removeRootFolder from "../utils/removeRootFolder"
import fixFilenameEncoding from "../utils/fixFilenameEncoding"
import path from "path"
import multer from "multer"
import os from "os"
import getContentPath from "../utils/getContentPath"
import getThumbnailPaths, {
    thumbnailsFolderPath,
} from "../utils/getThumbnailPath"

const router = express.Router()
const prisma = new PrismaClient()

/* === GET /api/content === */
router.get(
    "/api/content",
    asyncHandler(async (req, res) => {
        const contents = await prisma.content.findMany()
        res.json(contents)
    })
)

/* === GET /api/content/:id === */
router.get(
    "/api/content/:id",
    asyncHandler(async (req, res) => {
        const content = await prisma.content.findUniqueOrThrow({
            where: { id: req.params.id },
        })
        res.json({
            ...content,
            hasFiles: fs.existsSync(
                path.join(__dirname, "..", "content", content.id)
            ),
            hasThumbnail:
                fs.existsSync(
                    path.join(__dirname, "..", "thumbnail", `${content.id}.jpg`)
                ) ||
                fs.existsSync(
                    path.join(__dirname, "..", "thumbnail", `${content.id}.png`)
                ),
        })
    })
)

/* === GET /api/content/:id/thumbnail === */
router.get(
    "/api/content/:id/thumbnail",
    asyncHandler(async (req, res) => {
        const content = await prisma.content.findUniqueOrThrow({
            where: { id: req.params.id },
        })

        const thumbnailPaths = getThumbnailPaths(content.id)

        for (const thumbnailPath in thumbnailPaths) {
            if (fs.existsSync(thumbnailPath)) {
                res.sendFile(thumbnailPath)
                return
            }
        }

        res.status(404).send("Thumbnail not found")
    })
)

/* === POST /api/content === */
const postModel = yup
    .object()
    .shape({
        title: yup.string().required(),
        parentId: yup.string().nullable(),
    })
    .noUnknown()
const upload = multer({
    preservePath: true,
    dest: path.join(os.tmpdir(), "swcp"),
})

router.post(
    "/api/content",
    upload.array("files"),
    asyncHandler(async (req, res) => {
        if (!req.files || !Array.isArray(req.files)) {
            res.status(400).send("No files were uploaded.")
            return
        }
        const data = postModel.cast(req.body)

        // create content
        const content = await prisma.content.create({ data })

        // upload files
        req.files.forEach((file) => {
            const filename = removeRootFolder(
                fixFilenameEncoding(file.originalname)
            )
            const dest = path.join(getContentPath(content.id), filename)
            console.log(filename, dest)
            fs.ensureDirSync(fs.dirname(dest))
            fs.moveSync(file.path, dest)
        })

        //  return sucess
        res.json(content)
    })
)

/* === PUT /api/content/:id/files === */
router.put(
    "/api/content/:id/files",
    upload.array("files"),
    async (req, res) => {
        if (!req.files || !Array.isArray(req.files)) {
            res.status(400).send("No files were uploaded.")
            return
        }

        const content = await prisma.content.findUniqueOrThrow({
            where: { id: req.params.id },
        })

        // upload files
        req.files.forEach((file) => {
            const filename = removeRootFolder(
                fixFilenameEncoding(file.originalname)
            )
            const dest = path.join(getContentPath(content.id), filename)
            fs.ensureDirSync(fs.dirname(dest))
            fs.moveSync(file.path, dest)
        })

        //  return sucess
        res.json({ success: true })
    }
)

/* === PUT /api/content/:id/thumbnail === */
router.put(
    "/api/content/:id/thumbnail",
    upload.single("thumbnail"),
    async (req, res) => {
        if (!req.file) {
            res.status(400).send("No file was uploaded.")
            return
        }

        const content = await prisma.content.findUniqueOrThrow({
            where: { id: req.params.id },
        })

        // upload files
        const dest = path.join(
            thumbnailsFolderPath,
            `${content.id}${path.extname(req.file.originalname)}`
        )
        fs.ensureDirSync(fs.dirname(dest))
        fs.moveSync(req.file.path, dest)

        //  return sucess
        res.json({ success: true })
    }
)

//* === PUT /api/content/:id === */
const putModel = yup
    .object()
    .shape({
        title: yup.string().required(),
        thumbnail: yup.string(),
        entry: yup.string(),
        parentId: yup.string(),
    })
    .noUnknown()

router.put(
    "/api/content/:id",
    asyncHandler(async (req, res) => {
        const data = putModel.cast(req.body)

        // update content
        const content = await prisma.content.update({
            where: { id: req.params.id },
            data,
        })

        // return sucess
        res.json(content)
    })
)

/* === DELETE /api/content/:id === */
router.delete(
    "/api/content/:id",
    asyncHandler(async (req, res) => {
        const content = await prisma.content.findUniqueOrThrow({
            where: { id: req.params.id },
        })

        // delete content
        await prisma.content.delete({
            where: { id: req.params.id },
        })

        // delete files
        const contentPath = path.join(__dirname, "..", "content", content.id)
        fs.rmdirSync(contentPath, { recursive: true })

        // delete thumbnail
        const thumbnailPaths = getThumbnailPaths(content.id)
        for (const thumbnailPath in thumbnailPaths) {
            if (fs.existsSync(thumbnailPath)) {
                fs.rm(thumbnailPath)
            }
        }

        res.send({ success: true })
    })
)

export default router
