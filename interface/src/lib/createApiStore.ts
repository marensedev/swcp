import axios from "axios"
import { useEffect, useState } from "react"

class DataContainer<T extends { id: string }> {
    data: { [key: string]: T } = {}
    loaded: boolean = false
    private listeners = [] as ((d: typeof this.data) => void)[]

    set(data: T[]) {
        this.data = Object.fromEntries(data.map((i) => [i.id, i]))
        this.loaded = true
        this.emitChange()
    }
    create(createdData: T) {
        this.data[createdData.id] = createdData
        this.emitChange()
    }
    update(updatedData: T) {
        this.data[updatedData.id] = updatedData
        this.emitChange()
    }
    delete(id: string) {
        delete this.data[id]
        this.emitChange()
    }

    private emitChange() {
        this.listeners.forEach((cb) => cb(this.data))
    }

    addListener(callback: (d: typeof this.data) => void) {
        this.listeners.push(callback)
    }
    removeListener(callback: (d: typeof this.data) => void) {
        this.listeners = this.listeners.filter((cb) => cb !== callback)
    }
}

const createApiStore = <T extends { id: string }>(endpoint: string) => {
    const dataContainer = new DataContainer<T>()
    const loaded = false

    // @ts-ignore
    if (!window.debugApiStore) window.debugApiStore = {}
    // @ts-ignore
    window.debugApiStore[endpoint] = dataContainer

    return {
        useAll() {
            const [state, setState] = useState<{ [key: string]: T }>(
                dataContainer.data
            )

            useEffect(() => {
                const cb = (d: { [key: string]: T }) => {
                    setState({ ...d })
                }
                dataContainer.addListener(cb)
                return () => dataContainer.removeListener(cb)
            }, [])

            return state
        },
        use(id: string | undefined) {
            const [state, setState] = useState<T | undefined>(
                id ? dataContainer.data[id] : undefined
            )

            useEffect(() => {
                if (!id) return

                const cb = (d: { [key: string]: T }) => {
                    setState(d[id])
                }
                dataContainer.addListener(cb)
                return () => dataContainer.removeListener(cb)
            }, [])

            return state
        },
        async fetch() {
            const result = await axios.get(`${endpoint}`)
            if (result.status === 200 && result.data.success) {
                dataContainer.set(result.data.data)
                return result.data.data
            }
            if (result.status === 200) {
                throw result.data.error
            } else {
                throw "500"
            }
        },
        async create(createData: Omit<T, "id"> | FormData) {
            const result = await axios.post(`${endpoint}`, createData)
            if (result.status === 200 && result.data.success) {
                dataContainer.create(result.data.data)
                return result.data.data
            }
            if (result.status === 200) {
                throw result.data.error
            } else {
                throw "500"
            }
        },
        async update(id: string, newData: Partial<Omit<T, "id">>) {
            const result = await axios.put(`${endpoint}/${id}`, newData)
            if (result.status === 200 && result.data.success) {
                dataContainer.update(result.data.data)
                return result.data.data
            }
            if (result.status === 200) {
                throw result.data.error
            } else {
                throw "500"
            }
        },
        async delete(id: string) {
            const result = await axios.delete(`${endpoint}/${id}`)
            if (result.status === 200 && result.data.success) {
                dataContainer.delete(id)
                return true
            }
            if (result.status === 200) {
                throw result.data.error
            } else {
                throw "500"
            }
        },
    }
}

export default createApiStore
