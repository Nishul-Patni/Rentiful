import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import bodyParser from "body-parser"
import { authMiddleware } from "./middleware/authMiddleware.js"
import tenantRoutes from "./routes/tenant-routes.js"
import managerRoutes from "./routes/manager-routes.js"


//Routes


//configurations
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
}));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cors());

//Routes
app.get("/", (req, res)=>{
    res.send("This is home route");
});

app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

//Server

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`Server is listening on ${port}`)
})