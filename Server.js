const express = require("express")
const { connectdb } = require("./Database/ConnectDb")
const cors = require("cors")
const router = require("./Routes/signupRoutes")

const app = express()
app.use(cors())
app.use(express.json())
app.set(express.static("Public"))
app.use(express.urlencoded({ extended: true }))
app.use("/api", router)


app.listen(9000, () => {
    console.log("Server is running at  9000 port")
})
connectdb()