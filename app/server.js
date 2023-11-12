/**
 * This is the main file that exports an Application class which handles the configuration and creation of the Express application.
 * The class defines methods that is creating the server, configuring the database, creating the routes, and handling errors.
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fileUpload = require("express-fileupload");
const cors = require('cors');



const { AllRoutes } = require("./router/router");
module.exports = class Application {

    #express = require("express");
    #app = this.#express();

    // Constructor method
    constructor(PORT, DB_URL){
        // Configure the database and the application, create routes, create the server, and handle errors
        this.configDatabase(DB_URL)
        this.configApplication()
        this.createRoutes()
        this.createServer(PORT)
        this.errorHandler()
    }

    // Method for configuring the application
    configApplication(){
        const path = require("path")

        // Handle CORS issue + connect to FrontEnd
        // Opret CORS konfiguration
        const corsOptions = {
            origin: 'https://cc-internship-frontend.onrender.com',
            credentials: true, // Tillader cookies at blive sendt på tværs af oprindelser
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        };
    
        // Brug cors middleware med de angivne indstillinger
        this.#app.use(cors(corsOptions));
        
        this.#app.use(this.#express.static(path.join(__dirname, "..", "public")))
        this.#app.use(this.#express.json());
        this.#app.use(this.#express.urlencoded({extended : true}));
        this.#app.use(cookieParser());
    }

    // Method for creating the server
    createServer(PORT){

        const http = require("http");
        const server = http.createServer(this.#app);

        // Start the server and log the port number
        server.listen(PORT, () => {
            console.log(`Server is running on  http://localhost:${PORT}`)
        })
    }

    // Method for configuring the database
    configDatabase(DB_URL){
        const mongoose = require("mongoose");

        // Connect to the database and log a success message
        mongoose.connect(DB_URL, (error) => {
            if(error) throw error
            return console.log("Connect to DB successful...")
        })
    }

    // Method for handling errors
    errorHandler(){
        this.#app.use((req, res, next) => {

            // Handle 404 errors
            return res.status(404).json({
                status : 404,
                success : false,
                message : "The page or address in question was not found"
            })
        });

        this.#app.use((error, req, res, next) => {

            // Handle Internal server errors
            const status = error?.status || 500;
            const message = error?.message || "InternalServerError";
            return res.status(status).json({
                status,
                success : false,
                message
            })
        })
    }


    
    // Method for creating the routes
    createRoutes(){
        
        const swaggerUi = require('swagger-ui-express');
        const swaggerSpecs = require('./swagger');

        // Serve swagger.yaml as a static file
        this.#app.use('/swagger.yaml', express.static(path.join(__dirname, 'swagger.yaml')));

        // Define a route for the root URL
        this.#app.get("/", (req, res, next) => {
            return res.json({
                message : "this is a new Express application"
            })
        })

        this.#app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, { swaggerOptions: { url: '/swagger.yaml' } }));

        // Use the imported AllRoutes object containing all defined routes
        this.#app.use(AllRoutes)

    }

}