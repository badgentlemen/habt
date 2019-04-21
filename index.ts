import { Habt } from './habt'

let searchTerm = "Реакт";

let habt = new Habt({
    searchTerm,
    orderBy: 'date'
});


habt.search().then(posts => {
    habt.isProcessDone
    console.log(posts);
})
