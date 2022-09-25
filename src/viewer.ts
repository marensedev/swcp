import { PrismaClient } from "@prisma/client"
import { readFile } from "fs/promises"
import Router from "koa-router"
import send from "koa-send"
import { URL } from "url"

const viewerRouter = new Router({
    prefix: "/viewer",
})
const prisma = new PrismaClient()

viewerRouter.get("/open/:contentId/:broadcasterId", async (ctx, next) => {
    // load IP
    const ip = ctx.request.ip

    // load and check referrer
    const referrer = ctx.header["referer"]
    if (!referrer) throw "no referrer"
    const referrerURL = new URL(referrer)

    // load and check UA
    const ua = ctx.request.headers["user-agent"]
    if (!ua) throw "no ua"

    // load and check broadcaster
    const broadcasterId = ctx.params.broadcasterId
    const broadcaster = await prisma.broadcaster.findUniqueOrThrow({
        where: { id: broadcasterId },
    })
    if (broadcaster.address !== referrerURL.host) throw "bad broadcaster"

    // load and check content
    const contentId = ctx.params.contentId
    const content = await prisma.content.findUniqueOrThrow({
        where: { id: contentId },
    })
    if (!content) throw "no content"
    if (!content.entry) throw "content not configured"

    //create session
    const session = await prisma.session.create({
        data: {
            contentId,
            broadcasterId,
            ip,
            ua,
        },
    })

    ctx.redirect(`/viewer/fs/${session.id}/${content.entry}`)
})

viewerRouter.get("/fs/:session/:path(.*)", async (ctx, next) => {
    const session = await prisma.session.findUniqueOrThrow({
        where: { id: ctx.params.session },
        select: {
            id: true,
            ip: true,
            ua: true,
            broadcaster: true,
            content: true,
        },
    })

    // check ua and ip
    const ip = ctx.request.ip
    const ua = ctx.request.headers["user-agent"]
    if (session.ip !== ip || session.ua !== ua) throw "bad ip or ua"

    // check referer
    const referrer = ctx.header["referer"]
    if (!referrer) throw "no referrer"
    const referrerURL = new URL(referrer)

    if (ctx.params.path === session.content.entry) {
        if (session.broadcaster.address !== referrerURL.host)
            throw "bad referrer"
    } else {
        console.log("Test", ctx.request.host, referrerURL.host)
        if (
            ctx.request.host.replace("localhost:8000", "localhost:3000") !==
            referrerURL.host
        )
            throw "bad referrer"
    }

    // set CSP
    ctx.set(
        "content-security-policy",
        `frame-ancestors ${session.broadcaster.address}`
    )
    ctx.set("x-frame-options", `ALLOW-FROM ${session.broadcaster.address}`)

    // send file
    const file = `./content/${session.content.id}/${ctx.params.path}`

    if (ctx.params.path === session.content.entry) {
        const data = await readFile(file, {
            encoding: "utf8",
        })

        ctx.body = data.replace("<head>", `<head><script></script>`)
    } else {
        await send(ctx, file)
    }
})

export default viewerRouter
