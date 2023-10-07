#! /usr/bin/env node
const runCommand              = require('./lib/runCommand.js');
const chalk                   = require('chalk');
const prompts                 = require('prompts');
const fs                      = require( 'fs' );
const format                  = /^[a-zA-Z\d-]+$/gm;

/**
 * Humanize a string by remove any hyphen and capitalize the first letter.
 *
 * @param {string} str The string to humanize.
 * @return {string} The humanized string.
 */
const humanize = (str) => {
    let i;
    const replaced = str.replace(/[^a-z0-9]/gi, '-');
    let frags = replaced.split('-');
    for (i = 0; i < frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
}

/**
 * Read a JSON file and return the contents as an object.
 *
 * @param {string} filePath The path to the file.
 * @param {function} cb The callback function.
 */
const readAndWritePackageJson = (filePath, callback) => {
    fs.readFile(filePath, (error, fileData) => {
        if (error) {
            return callback && callback(error);
        }
        try {
            const object = JSON.parse(fileData);
            return callback && callback(null, object);
        } catch (error) {
            return callback && callback(error);
        }
    });
}
/**
 * Read a file and replace a string with another string.
 *
 * @param {string} filePath The path to the file.
 * @param {function} callback The callback function.
 */
const updateDocusaurusConfig = (filePath, callback) => {
    fs.readFile(
        filePath,
        'utf-8',
        (error, fileData) => {
            if (error) {
                return callback && callback(error);
            }

            try {
                return callback && callback(null, fileData);
            } catch (error) {
                return callback && callback(error);
            }
        }
    );
}


(async () => {
    const questions = [
        {
            type: 'text',
            name: 'value',
            message: 'What is the name of your blog?',
            validate: value =>  value.length > 0 && format.test(value) ? true : 'Only letters, and hyphens are allowed.'
        },
        {
            type: 'text',
            name: 'description',
            message: 'What is the description of your blog?',
            validate: value =>  value.length > 0 ? true : 'Please enter a description.'
        },
        {
            type: 'text',
            name: 'author',
            message: 'What is the author of your blog?',
            validate: value =>  value.length > 0 ? true : 'Please enter an author.'
        }
    ];
    const response = await prompts(questions);
    return response;
})().then( response => {
    
    const gitCheckoutCommand        = `npx degit https://github.com/TienNHM/personal-blog-template.git ${response.value}`;
    const npmInstallCommand         = `cd ${response.value} && npm install`;
    const gitInitCommand            = `cd ${response.value} && git init`;
    const gitFixCrLfCommand         = `cd ${response.value} && git config core.autocrlf false`;
    const gitCommitMasterCommand    = `cd ${response.value} && git add . && git commit -m "Initial commit" -q && git branch -M master`;
    const gitCheckoutGhPagesCommand = `cd ${response.value} && git checkout -b gh-pages && git checkout master`;

    // console.log(`${chalk.blue('')}`);
    // console.log(`${chalk.blue('  ___ ___ __  __ ___ _    ___   ___ _    ___   ___ ')}`);
    // console.log(`${chalk.blue(' / __|_ _|  \/  | _ \ |  | __| | _ ) |  / _ \ / __|')}`);
    // console.log(`${chalk.blue(' \__ \| || |\/| |  _/ |__| _|  | _ \ |_| (_) | (_ |')}`);
    // console.log(`${chalk.blue(' |___/___|_|  |_|_| |____|___| |___/____\___/ \___|')}`);
    // console.log(`${chalk.blue('')}`);

    console.log('');
    console.log(`Creating a new blog called ${chalk.blue(response.value)}...`);
    console.log('');
    // console.log('Cloning the repo...');

    checkedOut = runCommand(gitCheckoutCommand);

    console.log(`Repo created ${chalk.green('Successfully!')} 🎉`);
    console.log('');
    // console.log('Updating package.json...');

    readAndWritePackageJson(
        `${response.value}/package.json`,
        (error, file) => {
            if (error) {
                console.error("Error reading file:", error);
                process.exit(1);
            }

            file.name        = `${response.value}`;
            file.description = `${response.description}`;
            file.author      = `${response.author}`;
            file.version     = `0.0.0`;

            fs.writeFileSync(
                `${response.value}/package.json`,
                JSON.stringify(file, null, 2),
                error => {
                    if (error) {
                        console.error(`${chalk.error('Error writing file: ')}`, error);
                        process.exit(1);
                    }
            });
        }
    );

    console.log('');
    console.log('Updating config...');
    console.log('');

    updateDocusaurusConfig(
        `${response.value}/docusaurus.config.js`,
        (error, contents) => {
            if (error) {
                console.error("Error reading file:", error);
                process.exit(1);
            }

            const replaced = contents.replace(/YourName/g, humanize(response.value));

            fs.writeFileSync(
                `${response.value}/docusaurus.config.js`,
                replaced, 'utf-8',
                error => {
                    if (error) {
                        console.error(`${chalk.error('Error writing file: ')}`, error);
                        process.exit(1);
                    }
            });
        }
    );

    console.log(`Installing dependencies for ${chalk.green(response.value)}...`);

    const installed = runCommand(npmInstallCommand);

    if (!installed) {
        console.error('Failed to install dependencies');
        process.exit(1);
    }

    console.log('Dependencies installed successfully.');
    console.log('');
    // console.log('Removing .git directory...');

    fs.rmSync('.git/', { recursive: true, force: true });

    const initGit = runCommand(gitInitCommand);

    if (!initGit) {
        console.error('Failed to initialize git');
        process.exit(1);
    }
    // console.log('Git initialized successfully 🎉.');

    const fixCrLf = runCommand(gitFixCrLfCommand);
    if (!fixCrLf) {
        console.error('Failed to fix CRLF');
    }

    const commitMaster = runCommand(gitCommitMasterCommand);
    if (!commitMaster) {
        console.error('Failed to commit master');
    }
    // console.log(`Commit ${chalk.green('master')} successfully 🎉.`);

    const checkoutGhPages = runCommand(gitCheckoutGhPagesCommand);
    if (!checkoutGhPages) {
        console.error('Failed to checkout gh-pages');
    }
    // console.log(`Create branch ${chalk.green('gh-pages')} successfully 🎉.`);

    console.log('');
    console.log(`Created ${chalk.blue(response.value)} at ${chalk.yellow(process.cwd() + '/' + response.value)} successfully!`);
    console.log('');
    console.log(`Please read the ${chalk.green('README.md')} file for more information. Inside that directory, you can run several commands:`);
    console.log('');
    console.log(`  ${chalk.yellow("npm")} run ${chalk.green('start')}`);
    console.log(`    ${chalk.italic('Starts the development server.')}`);
    console.log('');
    console.log(`   ${chalk.yellow("npm")} run ${chalk.green('build')}`);
    console.log(`    ${chalk.italic('Bundles the app files for production.')}`);
    console.log('');
    console.log('______________________________________________');
    console.log('');
    console.log(`                ${chalk.blue("Happy Coding!")}                `);
    console.log('______________________________________________');
    console.log('');

}).catch( error => {
    console.error(`${chalk.error('Error: ')}`, error);
    }
);