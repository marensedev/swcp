import { LinearProgress } from "@mui/material"
import axios from "axios"
import { useState } from "react"

function Uploader() {
    const upload = async (event: any) => {
        const file = event.target.files[0] as File

        const formData = new FormData()
        formData.append("zip", file)
        formData.append("title", "test")

        const uploadResult = await axios.post(`/api/content`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })

        console.log("succes", uploadResult)
    }

    return (
        <div>
            <input type="file" name="filefield" onChange={upload} />
        </div>
    )
}

export default Uploader
