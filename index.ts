import { Habt } from './habt'

let searchTerm = "Илон Маск";

let habt = new Habt({
    searchTerm,
    orderBy: 'date'
});


habt.search().then(posts => {
    habt.isProcessDone
    console.log(posts);
})
