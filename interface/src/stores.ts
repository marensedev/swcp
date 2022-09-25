import createApiStore from "./lib/createApiStore"

export interface IContent {
    id: string
    title: string
    parentId?: string | null
}
export const contentStore = createApiStore<IContent>("/api/content")

export interface IFolder {
    id: string
    title: string
    parentId?: string | null
    entry?: string
}
export const folderStore = createApiStore<IFolder>("/api/folder")
