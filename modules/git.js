import { spawn } from 'child_process';

function gitClone(newGitLink) {
    return new Promise((resolve, reject) => {
        const gitCommand = 'git';
        const cloneArgs = ['clone', newGitLink];

        const gitCloneProcess = spawn(gitCommand, cloneArgs, { stdio: 'inherit' });

        gitCloneProcess.on('error', (error) => {
            console.error(`Error: ${error.message}`);
            reject(error);
        });

        gitCloneProcess.on('close', (code) => {
            console.log('\x1b[32m%s\x1b[0m', 'Repository cloned successfully');
            resolve(code);
        });
    });
}

function createNewGitLink(input, newHostName) {
    const [user, rest] = input.split('@');
    const [oldHostName, repo] = rest.split(':');
    const newLink = `git@${newHostName}:${repo}`;
    const folderName = repo.split('/')[1].slice(0, -4);

    return [newLink, folderName];
}

function getGitHubLinkFromCLI() {
    const link = process.argv[2];

    if (!link) {
        throw new Error('github link is required. Please provide a link to the repository.');
    }

    return link;
}

function updateGitConfig(selectedProfile, identities, folderName) {
    return new Promise((resolve, reject) => {
        const { name, email } = identities[selectedProfile];

        const command = `git config user.name "${name}" && git config user.email "${email}"`;

        const updateGitConfigProcess = spawn(command, [], { stdio: 'inherit', shell: true, cwd: folderName });

        updateGitConfigProcess.on('error', (error) => {
            console.error(`Error spawning process: ${error}`);
            reject(error);
        });

        updateGitConfigProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\x1b[32m%s\x1b[0m', 'Git config updated successfully');

                resolve();
            } else {
                reject(new Error(`Git config update failed. Process exited with code ${code}`));
            }
        });
    });
}

export {
    gitClone,
    createNewGitLink,
    getGitHubLinkFromCLI,
    updateGitConfig
}
