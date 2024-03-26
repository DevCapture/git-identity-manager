import { homedir } from 'os';
import { promises as fs } from 'fs';
import { validate } from './config.js';
const CONFIG_FILE_NAME = '.git-identities.json';

export default class IdentityManager {
    constructor() {
        this.identities = null;
        this.configFilePath = `${homedir()}/${CONFIG_FILE_NAME}`;
    }

    async getIdentities() {
        await this.#checkIfIdentitiesExist();

        return this.identities;
    }

    async getIdentityNameList() {
        await this.#checkIfIdentitiesExist();

        return Object.keys(this.identities);
    }

    async #readIdentities() {
        try {
            this.identities = await this.#readJsonFile(this.configFilePath);

            return this.identities;
        } catch (error) {
            throw error
        }
    }

    async #checkIfFileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch (error) {
            throw new Error(`Config file not found: ${error.message}`);
        }
    }

    async #checkIfIdentitiesExist() {
        if (this.identities === null) {
            this.identities = await this.#readIdentities();
        }
    }

    async #readJsonFile(filePath) {
        try {
            await this.#checkIfFileExists(filePath);

            const data = await fs.readFile(filePath, 'utf8');
            const configData = JSON.parse(data);
            this.#validateConfig(configData);

            return configData;
        } catch (error) {
            throw new Error(`Failed to read or parse the JSON file: ${error.message}`);
        }
    }

    #validateIdentityEntry(identityConfig) {
        const valid = validate(identityConfig);
        if (!valid) {
            return validate.errors.map(error => `${error.instancePath} ${error.message}`);
        }
        return [];
    }

    #validateConfig(identityConfig) {
        Object.entries(identityConfig).forEach(([profileName, identityConfig]) => {
            const validationErrors = this.#validateIdentityEntry(identityConfig);
            if (validationErrors.length > 0) {
                throw new Error(`Invalid configuration for profile "${profileName}". ${validationErrors.join(', ')}`);
            }
        });

        return this.identities;
    }
}
