function sortArrayByAnotherArray(array1, array2 ,option) {
    return array1.sort((a, b) => {
        const aIndex = array2.findIndex(item => item === a[option]);
        const bIndex = array2.findIndex(item => item === b[option]);
        if (aIndex === -1) {
            return 1;
        }
        if (bIndex === -1) {
            return -1;
        }
        return aIndex - bIndex;
    });
}