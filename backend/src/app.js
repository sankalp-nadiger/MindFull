import express from "express"
import cors from "cors"
import http from "http"
import cookieParser from "cookie-parser"
import axios from 'axios'
//import {cheerio} from 'cheerio'

//router imports
import userRouter from './routes/user.routes.js'
import resourceRouter from "./routes/resource.routes.js"
import activityRouter from "./routes/activity.routes.js"
//import communityRouter from "./routes/community.routes.js"
import counsellorRouter from "./routes/counsellor.routes.js"
import dm_chatRouter from "./routes/dm_chat.routes.js"
//import eventRouter from "./routes/event.routes.js"
import journalRouter from "./routes/journal.routes.js"
//import notificationRouter from "./routes/notification.routes.js"
import parentRouter from "./routes/parent.routes.js"
//import sessionRouter from "./routes/session.routes.js"
import storyRouter from "./routes/story.routes.js"
//import moodRouter from "./routes/mood.routes.js"

//service imports
import {setupSignalServer} from './services/signalserver.js'
import {setupchat} from './services/chat.js'


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
app.use("/api/activity",activityRouter)
//app.use("/api/community",communityRouter)
app.use("/api/counsellor",counsellorRouter)
app.use("/api/dm_chat",dm_chatRouter)
//app.use("/api/event",eventRouter)
//app.use("/api/notifications",notificationRouter)
app.use("/api/parent",parentRouter)
//app.use("/api/session",sessionRouter)
app.use("/api/story",storyRouter)
// app.use("/api/mood",moodRouter)

export default app;