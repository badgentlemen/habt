import { Habt } from './habt'
const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const ora = require('ora');

const cleanup = () => {
    clear();
};

const notFoundMessage = 'По запросу ничего не найдено';

cleanup();

console.log(
    chalk.yellow(
        figlet.textSync('Habt', { horizontalLayout: 'full' })
    )
);

process.stdin.setEncoding('utf8');

const runEnterTerm = () => {
    const message = 'Введите фразу для поиска: '
    const questions = [{
        name: 'term',
        type: 'input',
        message,
        validate: (value: string) => {
            if (value.length) {
                return true;
            } else {
                return message;
            }
        }
    }, {
        name: "orderBy",
        message: "Выберите упорядоченность статей?",
        type: "list",
        choices: [
            { name: "date", checked: true },
            { name: "relevance", checked: false },
            { name: "rating", checked: false }
        ]
    }]
    return inquirer.prompt(questions);
};

const handleExit = () => {
    // 
    process.exit();
};

const handleError = () => {
    // 
    process.exit(1);
};

const run = async () => {
    const questions = await runEnterTerm();
    const searchTerm = questions.term;
    const orderBy = questions.orderBy;
    const habt = new Habt({
        searchTerm,
        orderBy,
    });
    const searchWaitingMessage = `Пожалуйста, подождите. Ищем статьи на Хабре по вашему запросу "${searchTerm}".`
    const spinner = ora(searchWaitingMessage).start();
    const posts = await habt.search();
    spinner.stop();
    console.log(posts.length > 0 ? posts : notFoundMessage);
};

run();
