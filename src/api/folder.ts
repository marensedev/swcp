import { PrismaClient } from "@prisma/client"
import Router from "koa-router"
import * as yup from "yup"

const folderRouter = new Router({
    prefix: "/api/folder",
})
const prisma = new PrismaClient()

folderRouter.get("/", async (ctx, next) => {
    const folders = await prisma.folder.findMany()
    ctx.body = { success: true, data: folders }
    await next()
})

const postSchema = yup.object({
    title: yup.string().required(),
    parentId: yup.string().nullable(),
})

folderRouter.post("/", async (ctx, next) => {
    const data = await postSchema.validate(ctx.request.body)

    const folder = await prisma.folder.create({
        data,
    })

    ctx.body = { success: true, data: folder }
    await next()
})

const putSchema = yup.object({
    title: yup.string(),
    parentId: yup.string().nullable(),
})

folderRouter.put("/:id", async (ctx, next) => {
    const id = ctx.params.id
    const data = await putSchema.validate(ctx.request.body)

    const folder = await prisma.folder.update({
        where: { id },
        data,
    })

    ctx.body = { success: true, data: folder }
    await next()
})

folderRouter.delete("/:id", async (ctx, next) => {
    const id = ctx.params.id

    const folder = await prisma.folder.delete({ where: { id } })

    ctx.body = { success: true }
    await next()
})

export default folderRouter
