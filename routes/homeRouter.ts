import express from "express";
import { FlashMessage } from "../interfaces";


export function homeRouter() {
    const router = express.Router();

    router.get("/", async(req, res) => {
        res.render("index", { errorMessage: null });
    });

    return router;
}