import inquirer from 'inquirer';
import IdentityManager from './modules/identity-manager.js';
import { gitClone, createNewGitLink, getGitHubLinkFromCLI, updateGitConfig } from './modules/git.js';
import { capitalizeFirstLetter } from './modules/string-utils.js';


async function askProfile(profileNames) {
    const choices = profileNames.map((profileName) => capitalizeFirstLetter(profileName));

    const { profile } = await inquirer.prompt([
        {
            type: 'list',
            name: 'profile',
            message: 'What profile do you want to use?',
            choices
        }
    ]);

    return profile.toLowerCase();
}

async function main() {
    const identityManager = new IdentityManager();
    try {
        const identities = await identityManager.getIdentities();
        const identityNames = await identityManager.getIdentityNameList();

        const selectedProfile = await askProfile(identityNames);

        const selectedHostName = identities[selectedProfile].customHostName;
        const link = getGitHubLinkFromCLI();
        const [newLink, folderName] = createNewGitLink(link, selectedHostName);

        await gitClone(newLink);
        await updateGitConfig(selectedProfile, identities, folderName);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `${error}`);
    }
}

export default main;
