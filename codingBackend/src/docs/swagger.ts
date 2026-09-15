import swaggerJSDoc from "swagger-jsdoc";
import {config} from "../config/env"

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info:   {
            title: config.appName,
            version: "1.0.0",
            description: "API documentation for the authentication service",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT Authorization header using the Bearer scheme"
                }
            },
            schemas: {
                ApiErrorResponse: {
                    type: "object",
                    properties: {
                        success: {type: "boolean", example: false},
                        message: {type: "string", example: "Something wemt wrong"},
                        errors: {type: "array",
                                 properties: {
                                    path: {type: "string"},
                                    message: {type: "string"},
                                 }
                        }
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        id: {type: "string", format: 'uuid'},
                        firstname: {type: "string", example: "jane"},
                        lastName: {type: "string", example: "Doe"},
                        email: {type: "string", format: "email", example: "janedoe@gmail.com"},
                        role: {type: "string", enum: ["user", "admin"]},
                        isEmailVerified: {type: "boolean"},
                        isActive: {type: "boolean"},
                        lastLoginAt: {type: "string", format: "date-time", nullable: true },
                        createdAt: {type: "string", format: "data-time"},
                    },
                },
            }
        },
    },
    apis: ["./src/routes/**/*.ts", "./src/index.ts"]
}
// const options: swaggerJSDoc.Options = {
//     definition:{
//         openapi: "3.0.0",
//         info: {
//             title: "my coding API",
//             version: "1.0.0",
//             description: "API documentation for My Coding API",
//         },
//         servers: [
//             {
//                 url: "https://localhost:3000"
//             }
//         ],
//     },
//     apis: ["./src/**/*.ts"]
// };




export const swaggerSpec = swaggerJSDoc(options);