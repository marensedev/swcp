import {
    Breadcrumbs,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
} from "@mui/material"
import { useEffect, useMemo, useRef, useState } from "react"
import { useHistory, useParams } from "react-router"
import { folderStore, contentStore, IFolder, IContent } from "../stores"
import FolderIcon from "@mui/icons-material/Folder"
import WebIcon from "@mui/icons-material/Web"
import HomeIcon from "@mui/icons-material/Home"
import { Link } from "react-router-dom"

const Folder = ({ folder }: { folder: IFolder }) => {
    const icon = useRef<Element>()
    const history = useHistory()

    const [selected, setSelected] = useState(false)

    return (
        <ListItem
            key={folder.id}
            disablePadding
            draggable="true"
            onDragStart={(event) => {
                event.dataTransfer.dropEffect = "move"
                event.dataTransfer.setData("application/folder", folder.id)
                if (icon.current)
                    event.dataTransfer.setDragImage(icon.current, -10, -10)
            }}
            onDragEnter={() => setSelected(true)}
            onDragExit={() => setSelected(false)}
            onDrop={(event) => {
                event.preventDefault()

                console.log("drop")

                if (event.dataTransfer.types.includes("application/folder")) {
                    const id = event.dataTransfer.getData("application/folder")
                    console.log("drop folder")
                    if (id != folder.id)
                        folderStore.update(id, { parentId: folder.id })
                }

                if (event.dataTransfer.types.includes("application/content")) {
                    const id = event.dataTransfer.getData("application/content")
                    contentStore.update(id, { parentId: folder.id })
                }

                setSelected(false)
            }}
            onDragOver={(event) => event.preventDefault()}
        >
            <ListItemButton
                selected={selected}
                disableRipple
                onClick={() => history.push(`/folder/${folder.id}`)}
            >
                <ListItemIcon ref={icon}>
                    <FolderIcon />
                </ListItemIcon>
                <ListItemText primary={folder.title} secondary={folder.id} />
            </ListItemButton>
        </ListItem>
    )
}

const Content = ({ content }: { content: IContent }) => {
    const icon = useRef<Element>()

    return (
        <ListItem
            disablePadding
            key={content.id}
            draggable="true"
            onDragStart={(event) => {
                event.dataTransfer.dropEffect = "move"
                event.dataTransfer.setData("application/content", content.id)
                if (icon.current)
                    event.dataTransfer.setDragImage(icon.current, -10, -10)
            }}
        >
            <ListItemButton disableRipple>
                <ListItemIcon ref={icon}>
                    <WebIcon />
                </ListItemIcon>
                <ListItemText primary={content.title} secondary={content.id} />
            </ListItemButton>
        </ListItem>
    )
}

const BreadcrumbItem = ({ id }: { id: string | null }) => {
    const folders = folderStore.useAll()
    const [selected, setSelected] = useState(false)

    return (
        <Link
            key={id}
            to={id ? `/folder/${id}` : "/folder"}
            onDragEnter={() => setSelected(true)}
            onDragExit={() => setSelected(false)}
            onDrop={(event) => {
                event.preventDefault()

                if (event.dataTransfer.types.includes("application/folder")) {
                    const fid = event.dataTransfer.getData("application/folder")
                    if (fid != id) folderStore.update(fid, { parentId: id })
                }

                if (event.dataTransfer.types.includes("application/content")) {
                    const cid = event.dataTransfer.getData(
                        "application/content"
                    )
                    contentStore.update(cid, { parentId: id })
                }

                setSelected(false)
            }}
            onDragOver={(event) => event.preventDefault()}
        >
            {id ? folders[id].title : "Mes contenus"}
        </Link>
    )
}

const FileExplorer = () => {
    const { id } = useParams<{ id: string }>()
    const current = id ?? null

    const folders = folderStore.useAll()
    const contents = contentStore.useAll()

    useEffect(() => {
        folderStore.fetch()
        contentStore.fetch()
    }, [])

    const foldersChildren = useMemo(() => {
        return Object.values(folders).filter(
            (folder) => folder.parentId === current
        )
    }, [current, folders])

    const contentsChildren = useMemo(() => {
        return Object.values(contents).filter(
            (content) => content.parentId === current
        )
    }, [current, contents])

    const list = useMemo(() => {
        if (!current || !folders[current]) return []

        let item = folders[current]
        const list = [item.id]

        while (item.parentId) {
            item = folders[item.parentId]
            list.unshift(item.id)
        }

        return list
    }, [current, folders])

    return (
        <div>
            <Breadcrumbs>
                <BreadcrumbItem id={null} />
                {list.map((item) => (
                    <BreadcrumbItem id={item} />
                ))}
            </Breadcrumbs>
            <Paper>
                <List dense>
                    {foldersChildren.map((folder) => (
                        <Folder key={folder.id} folder={folder} />
                    ))}
                    {contentsChildren.map((content) => (
                        <Content key={content.id} content={content} />
                    ))}
                </List>
            </Paper>
            <Paper
                onDragOver={(event) => event.preventDefault()}
                onDrop={(ev) => {
                    ev.preventDefault()

                    const upload = async (file: File) => {
                        var bodyFormData = new FormData()
                        bodyFormData.append("title", "Nouveau fichier")
                        if (current) bodyFormData.append("parentId", current)
                        bodyFormData.append("zip", file)

                        await contentStore.create(bodyFormData)
                    }

                    if (ev.dataTransfer.items) {
                        const item = ev.dataTransfer.items[0]
                        if (item.kind === "file") {
                            const file = item.getAsFile()
                            if (!file) return
                            upload(file)
                        }
                    } else {
                        const file = ev.dataTransfer.files[0]
                        upload(file)
                    }
                }}
            >
                Upload there
            </Paper>
        </div>
    )
}

export default FileExplorer
