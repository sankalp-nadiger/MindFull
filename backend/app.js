import express from "express"
import cors from "cors"
import http from "http"
import cookieParser from "cookie-parser"
import userRouter from './routes/user.routes'
import {setupSignalServer} from './services/signalserver.js'
import {setupchat} from './services/signalserver.js'

const app = express();
const server = http.createServer(app);
setupSignalServer(server);
setupchat(server)
// app.options('*', cors()); 
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], 
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

server.listen(3000, () => console.log('Signaling server running on port 3000'));

app.use("/api/users",userRouter)
app.use("/api/resources",resourceRouter)
app.use("/api/journals",journalRouter)
app.use("/api/session",sessionRouter)

module.exports= app;