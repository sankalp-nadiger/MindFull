import dotenv from "dotenv"
import connectDB from "./utils/db.connect.js";
//import {app} from './app.js'
dotenv.config({
    path: './.env'
})

connectDB()
<<<<<<< HEAD
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO db connection failed !!! ", err);
// })
=======
/*.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})*/
>>>>>>> dd7b515eeab5eda9a6661d9432ff388bf3de8696
