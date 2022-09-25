import { PrismaClient } from "@prisma/client"
import { mkdirSync, rmSync } from "fs"
import Router from "koa-router"
import AdmZip from "adm-zip"

import * as yup from "yup"

const contentRouter = new Router({
    prefix: "/api/content",
})
const prisma = new PrismaClient()

contentRouter.get("/", async (ctx, next) => {
    const contents = await prisma.content.findMany()
    ctx.body = { success: true, data: contents }
    await next()
})

const postSchema = yup.object({
    title: yup.string().required(),
    entry: yup.string().nullable(),
    parentId: yup.string().nullable(),
})

contentRouter.post("/", async (ctx, next) => {
    const data = await postSchema.validate(ctx.request.body)

    // @ts-ignore
    const file = ctx.request.files?.zip
    if (!file || Array.isArray(file)) throw "file error"

    const content = await prisma.content.create({
        data,
    })

    const folder = `./content/${content.id}/`

    const zip = new AdmZip(file.filepath)
    mkdirSync(folder)
    zip.extractAllTo(folder)

    ctx.body = { success: true, data: content }
    await next()
})

const putSchema = yup.object({
    title: yup.string(),
    entry: yup.string().nullable(),
    parentId: yup.string().nullable(),
})

contentRouter.put("/:id", async (ctx, next) => {
    const id = ctx.params.id
    const data = await putSchema.validate(ctx.request.body)

    const content = await prisma.content.update({
        where: { id },
        data,
    })

    ctx.body = { success: true, data: content }
    await next()
})

contentRouter.delete("/:id", async (ctx, next) => {
    const id = ctx.params.id

    const content = await prisma.content.delete({ where: { id } })
    rmSync(`./content/${content.id}/`, { recursive: true, force: true })

    ctx.body = { success: true }
    await next()
})

export default contentRouter
