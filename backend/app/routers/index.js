const http = require('http');
const express = require('express');
const patientRoute = require('./patient/index');
const multerRoute = require('./multer/index');
const medicalreport = require('./medicalreport/index');
const appointmentRoute = require('./appointments/index');
const doctorRoute = require('./doctor/index');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

class Router {
    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        
        this.corsOptions = {
            origin: '*',
            methods: '*',
            allowedHeaders: ['Content-Type', 'Authorization', 'verification', 'authorization','x-auth-token'],
            exposedHeaders: ['Authorization', 'authorization'],
            credentials: true,
        };
    }

    async initialize() {
        this.setupMiddleware();
        this.setupServer();
    }

    setupMiddleware() {
        this.app.disable('etag');
        this.app.enable('trust proxy');

        this.app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        frameAncestors: ["'self'", "http://localhost:3000"],
                        imgSrc: ["'self'", "data:", "blob:"],
                        mediaSrc: ["'self'", "data:", "blob:"],
                        connectSrc: ["'self'"],
                    }
                }
            })
        );
        this.app.use(cors(this.corsOptions));
        this.app.use((req, res, next) => {
            res.setHeader(
                'Content-Security-Policy', 
                "default-src 'self'; frame-ancestors 'self' http://localhost:3000; img-src 'self' data: blob:; media-src 'self' data: blob:;"
            );
            
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'ALLOW-FROM http://localhost:3000');
            
            next();
        });
        this.app.use(compression());
        this.app.use(bodyParser.json({ limit: '16mb' }));
        this.app.use(
            bodyParser.urlencoded({
                limit: '16mb',
                extended: true,
                parameterLimit: 50000,
            })
        );

        if (process.env.NODE_ENV !== 'prod')
            this.app.use(
                morgan('dev', {
                    skip: req => req.path === '/ping' || req.path === '/favicon.ico',
                })
            );

        this.app.use(this.routeConfig);
        this.app.use(express.static('./seeds'));

        this.app.use('/patient', patientRoute);
        this.app.use('/appointments', appointmentRoute);
        this.app.use('/multer',multerRoute );
        this.app.use('/medical-reports',medicalreport );
        this.app.use('/doctors', doctorRoute);
        // this.app.use('/sad', adminmedicalreport);

        this.app.use('*', this.routeHandler);
        this.app.use(this.logErrors);
        this.app.use(this.errorHandler);
    }

    setupServer() {
        this.httpServer = http.Server(this.app);
        this.httpServer.timeout = 300000;
        this.httpServer.listen(process.env.PORT, '0.0.0.0', () => log.blue(`Spinning on ${process.env.PORT} 🌱\n------------------------`));
    }

    routeConfig(req, res, next) {
        req.sRemoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (req.path === '/ping') return res.status(200).send({});
        res.reply = ({ code, message }, data = {}, header = undefined) => {
            res.status(code).header(header).json({ message, data });
        };
        next();
    }

    routeHandler(req, res) {
        res.status(404);
        res.send({ message: 'Route not found' });
    }

    logErrors(err, req, res, next) {
        log.error('body -> ', req.body);
        log.error(`${req.method} ${req.url}`);
        log.error(err.stack);
        return next(err);
    }

    errorHandler(err, res) {
        res.status(500);
        res.send({ message: err });
    }
}

module.exports = new Router();
