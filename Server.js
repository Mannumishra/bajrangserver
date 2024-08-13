const express = require("express")
const { connectdb } = require("./Database/ConnectDb")
const cors = require("cors")
const router = require("./Routes/signupRoutes")
const dotenv = require("dotenv")
const slipRouter = require("./Routes/ReciptRouter")
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.set(express.static("Public"))
app.use(express.urlencoded({ extended: true }))
app.use("/api", router)
app.use("/api", slipRouter)

app.get("/" ,async(req,res)=>{
    res.send("Welcome")
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT} port`)
})
connectdb()