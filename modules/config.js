import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

const identitySchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" },
        customHostName: { type: "string" }
    },
    required: ["name", "email", "customHostName"],
    additionalProperties: false
};

const validate = ajv.compile(identitySchema);


export {
    validate
};
