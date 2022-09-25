import Koa from "koa"

import json from "koa-json"
import koaBody from "koa-body"

import contentRouter from "./api/content"
import folderRouter from "./api/folder"
import viewerRouter from "./viewer"

const app = new Koa()

// midlewares
app.use(json())
app.use(
    koaBody({
        formidable: { uploadDir: "./tmp" },
        multipart: true,
        urlencoded: true,
    })
)

// api
app.use(contentRouter.routes()).use(contentRouter.allowedMethods())
app.use(folderRouter.routes()).use(folderRouter.allowedMethods())

// viewer
app.use(viewerRouter.routes()).use(viewerRouter.allowedMethods())

app.listen(8000)
