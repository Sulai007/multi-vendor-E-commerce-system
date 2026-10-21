import swaggerJSDoc from "swagger-jsdoc";
import {config} from "../config/env"

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info:   {
            title: config.appName,
            version: "1.0.0",
            description: "API documentation for the multi-vendor ecommerce platform",
        },
        servers: [{ url: config.apiBaseUrl }],
        components: {
            parameters: {
                IdempotencyKey: {
                    name: "Idempotency-Key",
                    in: "header",
                    required: true,
                    description: "Unique key for this request. Reuse the key only when retrying the identical request.",
                    schema: { type: "string", minLength: 1, maxLength: 255 },
                },
            },
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
                        firstName: {type: "string", example: "Jane"},
                        lastName: {type: "string", example: "Doe"},
                        address: {type: "string", nullable: true},
                        email: {type: "string", format: "email", example: "janedoe@gmail.com"},
                        role: {type: "string", enum: ["user", "vendor", "admin"]},
                        isEmailVerified: {type: "boolean"},
                        isActive: {type: "boolean"},
                        lastLoginAt: {type: "string", format: "date-time", nullable: true },
                        createdAt: {type: "string", format: "date-time"},
                    },
                },
                Pagination: {
                    type: "object",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        totalItems: { type: "integer", example: 42 },
                        totalPages: { type: "integer", example: 5 },
                    },
                },
            }
        },
    },
    apis: ["./src/routes/**/*.ts", "./src/docs/**/*.ts", "./src/index.ts"]
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