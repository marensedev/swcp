import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { contentStore, folderStore } from "../stores"
import FolderIcon from "@mui/icons-material/Folder"

const App = () => {
    const [current, setCurrent] = useState<string | null>(null)

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

    return (
        <div>
            <List>
                {foldersChildren.map((folder) => (
                    <ListItem key={folder.id}>
                        <ListItemButton onClick={() => setCurrent(folder.id)}>
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={folder.title}
                                secondary={folder.id}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
                {contentsChildren.map((folder) => (
                    <ListItem key={folder.id}>
                        <ListItemText
                            primary={folder.title}
                            secondary={folder.id}
                        />
                    </ListItem>
                ))}
            </List>
            <input
                value="dossier aleatoire"
                type="button"
                onClick={() =>
                    folderStore.create({
                        title: "dossier aleatoire",
                        parentId: current,
                    })
                }
            />
            <input
                value="contenu aleatoire"
                type="button"
                onClick={() =>
                    contentStore.create({
                        title: "contenu aleatoire",
                        parentId: current,
                    })
                }
            />
        </div>
    )
}

export default App
