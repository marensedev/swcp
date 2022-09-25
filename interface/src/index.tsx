import React from "react"
import ReactDOM from "react-dom"
import { Route, Switch } from "react-router"
import { BrowserRouter } from "react-router-dom"
import App from "./components/App"
import FileExplorer from "./components/FileExplorer"

const AppRoot = () => {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <Switch>
                    <Route path="/folder/:id?">
                        <FileExplorer />
                    </Route>
                </Switch>
            </BrowserRouter>
        </React.StrictMode>
    )
}

ReactDOM.render(<AppRoot />, document.getElementById("root"))
