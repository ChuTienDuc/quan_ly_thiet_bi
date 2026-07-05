function autoComplete(listName, data) {
    var selector = "input[list =" + listName + "]";
    var html = '';
    html += `<datalist id= ${JSON.stringify(listName)}>`
    data.forEach(element => {
        html += `<option>${(element)}</option>`;
    });

    $(selector).append(html)
}
function fillerData(data) {
    data = data.filter(function (item, index) {
        return data.indexOf(item) === index;
    });
    return data;
}
function getAllValuesByKey(key, arr) {
    const values = arr.map(elm => elm[key]);
    return values.flat();
}
function getAllValuesByKey1(key, arr, key2) {
    const values = arr.map(elm => ({ name: elm[key], _id: elm[key2] }));
    return values.flat();
}
function autoCompleteInput(name, namedatalist, dataDevice) {
    var data = getAllValuesByKey(name, dataDevice)
    data = data.filter(function (item, index) {
        return data.indexOf(item) === index;
    });
    autoComplete(namedatalist, data);
}
function autoCompleteInput1(name, namedatalist, name1, dataDevice) {
    var data = getAllValuesByKey(name, dataDevice)
    var data1 = getAllValuesByKey(name1, data)
    data1 = data1.filter(function (item, index) {
        return data1.indexOf(item) === index;
    });
    if (name1 == "size" || name1 == "vram") {
        // data1 = data1.map(s => parseInt(s.match(/\d+/)[0]));
    }
    autoComplete(namedatalist, data1);
}