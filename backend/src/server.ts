import Fastify from "fastify";
import cors from '@fastify/cors'
import { appRoutes } from './routes'
const app = Fastify()

app.register(appRoutes)
app.register(cors)


app.listen({
    port: 3252,
    host: '0.0.0.0'
}).then(()=>console.log('Server iniciado!'))