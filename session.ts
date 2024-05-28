import { uri } from "./database";
import session, { Store } from "express-session";
import { User, FlashMessage } from "./interfaces";
import mongoDbSession from "connect-mongodb-session";
import { NextFunction, Request, Response } from "express";


const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: uri,
    collection: "sessions",
    databaseName: "login-express",
});

declare module 'express-session' {
    export interface SessionData {
        user?: User
    }
}

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: mongoStore as Store,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
});

export default sessionMiddleware;

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        next();
    } else {
        res.redirect("/login");
    }
};

export interface SessionData {
    user?: User;
    message?: FlashMessage;
}