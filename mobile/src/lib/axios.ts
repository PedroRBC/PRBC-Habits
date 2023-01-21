import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://pedrorbc.com:3252'
})