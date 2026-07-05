$(document).ready(() => {
    renderAllCase()
})
const datacase = [];
var dataComplete = []
var ObjSupplier = {}

function renderOptionSupplier() {
    $.ajax(GVS.setting(GVS.GetAllSupplier, "GET")).done((res) => {
        var html = ''
        res.metadata.forEach((el) => {
            html += `<option value = "${el._id}">${el.name}</option>`
            ObjSupplier[el._id] = el.name
        })
        $("#supplier_addcase").html(html)
        $("#supplier_updatecase").html(html)
    })
}
// function sortArrayByAnotherArray(array1, array2) {
//     return array1.sort((a, b) => {
//         const aIndex = array2.findIndex(item => item === a._id);
//         const bIndex = array2.findIndex(item => item === b._id);
//         if (aIndex === -1) {
//             return 1;
//         }
//         if (bIndex === -1) {
//             return -1;
//         }
//         return aIndex - bIndex;
//     });
// }
let arrSortWithStatus = [0, 1, -1]
function autocompleteCreateCase() {
    autoCompleteInput("billPrice", "datalistbillprice", datacase)
    autoCompleteInput("macAddress", "datalistmacaddress", datacase)
    autoCompleteInput("mainBoard", "datalistmainbroard", datacase)
    autoCompleteInput("PSU", "datalistpsu", datacase)
    autoCompleteInput("chipset", "datalistchipset", datacase)
    autoCompleteInput("ram", "datalistram", datacase)
    autoCompleteInput1("VGA", "datalistvga", "name", datacase)
    autoCompleteInput1("VGA", "datalistvram", "vram", datacase)
    autoCompleteInput1("hardDrives", "datalistsize", "size", datacase)
    autoCompleteInput1("hardDrives", "datalistbrand", "brand", datacase)
}
function renderAllCase() {
    $.ajax(GVS.setting(GVS.GetAllDeciveByType, 'POST', {
        type: "case"
    })).done(res => {
        var data = res.metadata
        var datas
        // let arr = datas
        datas = renderDeviceByStatus(data, datas)
        sortArrayByAnotherArray(datas, arrSortWithStatus, 'status')
        datas.forEach(el => {
            datacase.push({
                _id: el._id,
                // name: el.name,
                PSU: el.attributes.PSU,
                VGA: el.attributes.VGA,
                chipset: el.attributes.chipset,
                hardDrives: el.attributes.hardDrives,
                macAddress: el.attributes.macAddress,
                mainBoard: el.attributes.mainBoard,
                num: el.attributes.num,
                ram: el.attributes.ram,
                billPrice: el.billPrice,
                totalPrice: el.totalPrice,
                createdAt: el.createdAt,
                expirationDate: el.expirationDate,
                location: el.location,
                note: el.note,
                user: el.user,
                supplier: el.supplier,
                status: el.status
            })
        })
        autocompleteCreateCase()
        renderTableMain(datacase);
        $("#table_case").DataTable(
            // {
            // "columnDefs": [
            //     {
            //       "targets": [0, 1], // Cột thứ 2 và cột thứ 4
            //       "visible": false,
            //       "searchable": false // Ẩn cả tính năng tìm kiếm của các cột này
            //     }
            //   ]
            // }
            {
                "pageLength": 50,
                lengthMenu: [20, 40, 50, 100, 200, 500],
            }
        )
        $('#preview').click(() => {
            if (validateInput()) {
                $("#_id_addcase").parent().parent().parent().css("display", "")
                $("#table_preview").css("display", "")
                $("#table_preview").append(`<div class="justify-content-center text-center mb-3 row p-0" id="action">
                <div class="col-1" style="width: max-content;">
                                    <button type="button" onclick="create()" class="btn btn-success px-4" style = "border-radius: 29px;
                                    background-color: #04A544;">
                                        Đồng ý
                                    </button>
                                </div>
                                <div class="col-1 ps-0">
                                    <button type="button"  onclick = "cancel()"  class="btn btn-danger"style = "background-color: #F81111;border-radius: 29px;padding-left: 45%;padding-right: 45%;">
                                        Hủy
                                    </button>
                                </div>
                            
                        </div>`)
                $("#input_case").css("display", "none")
                getValueInput();
                var dataCreate = {
                    quantity: parseInt($("#quantity").val()),
                    // name: $("#name_addcase").val(),
                    macAddress: $("#mac_address_addcase").val(),
                    mainBoard: $("#main_board_addcase").val(),
                    hardDrives: arrhardDrives,
                    PSU: $("#PSU_addcase").val(),
                    ram: arrRAM,
                    chipset: $("#chipset_addcase").val(),
                    VGA: arrVGAandConnector,
                    supplier: $("#supplier_addcase").val(),
                    expirationDate: $("#expirationDate").val(),
                    totalPrice: $("#total_price").val(),
                    billPrice: $("#bill_price").val(),
                    note: $("#note_addcase").val()
                }
                CreateDataComplete(datacase, dataCreate, dataComplete)
                $("#preview").parent().parent().css("display", "none")
            }
        })
    })
    $("#_id_addcase").parent().parent().parent().css("display", "none");
    $("#table_preview").css("display", "none");
}

function showColumns() {
    table.columns([1, 3]).visible(true);
}

function renderTableMain(datacase) {
    var html = "";
    var statusChange = {
        "0": "Đang sử dụng",
        "-1": "Đã hỏng",
        "1": "Chưa sử dụng"
    }
    datacase.forEach((el, index) => {
        if (el.status == -1) {
            html += `<tr class= "align-middle text-center " style = "background-color:#faaaaa">`
        } else if (el.status == 1) {
            html += `<tr class= "align-middle text-center" style = "background-color: #fffeb6bf">`
        } else {

            html += `<tr class= "align-middle text-center">`

        }
        html += `
            <td class = "p-1">
                    <a href = "/api/device/details/${el._id}">
                        <i class='fa fa-eye c-purple p-2'  style ="font-size: 1rem ;"></i>
                    </a>
            </td>
            <td>${el.num}</td>
            
            <td>${el.chipset}
            </td>
            <td>`
        const result = {}
        el.ram.forEach((el, index) => {
            if (result[el]) {
                result[el]++
            } else result[el] = 1;
        })
        for (const [key, value] of Object.entries(result)) {
            if (value > 1) {
                html += `<div>x${value} ${key}</div>`
            } else
                html += `<div>${key}</div>`
        }
        html += `</td>
                    <td>`
        el.VGA.forEach((el, index) => {
            html += `<div style = "white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${el.name} ${el.vram}</div>`
        })
        html += `</td><td>`
        el.VGA.forEach((el, index) => {
            el.connector.forEach((elm) => {
                html += `<div style = "white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">${elm}</div>`
            })
        })
        html += `</td><td>`
        el.hardDrives.forEach((el, index) => {
            html += `
                 <div>${el.brand} ${el.size} ${el.type}</div>`
        })
        html += `</td>`
        html += `
                <td>${el.PSU}</td>
                <td class = "">${statusChange[JSON.stringify(el.status)]}</td>
                <td>${el.location ? el.location.name ? el.location.name : "" : ""}</td>
                <td>${el.location ? el.location.floor : ""}</td>
                <td>${!el.note ? "" : el.note}</td>
                <td>${el.supplier ? el.supplier.name : ""}</td>
                <td>${el.macAddress}</td>
                <td>${el.mainBoard}</td>
                <td> ${el.createdAt != null ? `${new Date(el.createdAt).toLocaleDateString('vi-VN')}` : ""}</td>
                <td> ${el.expirationDate != null ? `${new Date(el.expirationDate).toLocaleDateString('vi-VN')}` : ""}</td>
                `
        html += `
            <td>${el.billPrice != null ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(el.billPrice)}` : ``}</td>`
    })
    $("#dataCase").html(html);
}
{/* <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(el.totalPrice)}</td> */ }

function fomatValue(e) {
    if ($(e).val() != "" && $(e).val().substring($(e).val().length - 2) != "GB" && $(e).val().substring($(e).val().length - 2) != "TB") {
        if ($(e).val() < 100) {
            $(e).attr("type", "text")
            $(e).val($(e).val() + "TB")
        } else {
            $(e).attr("type", "text")
            $(e).val($(e).val() + "GB")
        }
    }
}

function fomatValueVramGB(e) {
    if ($(e).val() != "" && $(e).val().substring($(e).val().length - 2) != "GB") {
        $(e).attr("type", "text")
        $(e).val($(e).val() + "GB")
    }
}

function fomatValueSize(e) {
    $(e).val(parseInt($(e).val()))
    $(e).select()
}

function fomatValueVram(e) {
    $(e).val(parseInt($(e).val()))
    $(e).select()
}

var arrRAM = [];
var arrVGA = [];
var arrVRAM = [];
var arrhardDrives = []
var arrVGAandConnector = []
var countRam = 1
var countVGA = 1

function getValueInput() {
    arrRAM = [];
    arrVGA = [];
    arrVRAM = [];
    arrhardDrives = []
    arrVGAandConnector = []
    // TODO input RAM
    var inputRAM = $("input[name^=ram]");
    for (i = 0; i < inputRAM.length; i++) {
        let el = inputRAM[i];
        arrRAM.push(el.value);
    }
    // TODO input VGA
    var inputVGA = $("input[name^=vga]");
    for (i = 0; i < inputVGA.length; i++) {
        let el = inputVGA[i];
        arrVGA.push(el.value);
    }
    // TODO input VRAM

    var inputVRAM = $("input[name^=vram]");
    for (i = 0; i < inputVRAM.length; i++) {
        let el = inputVRAM[i];
        arrVRAM.push(el.value);
    }
    // TODO input Connector
    for (let index = 0; index < inputVRAM.length; index++) {
        var arrconnector = [];
        var name = `select[name^=connector_${index}]`
        var inputConnector = $(name);
        for (i = 0; i < inputConnector.length; i++) {
            let el = inputConnector[i];
            arrconnector.push(el.value);
        }
        arrVGAandConnector.push({
            name: arrVGA[index],
            vram: arrVRAM[index],
            connector: arrconnector
        })
    }
    // TODO input hardDrives
    var inputSize = $("input[name^=size]");
    var inputType = document.getElementsByName('type')
    var inputBrand = $("input[name^=brand]");
    for (i = 0; i < inputSize.length; i++) {
        arrhardDrives.push({
            size: inputSize[i].value,
            type: inputType[i].value,
            brand: inputBrand[i].value
        });
    }
}
function addConnector(e, count) {
    var name = `connector_${count}`
    $(e).parent().parent().parent().append(`
    <div class="row justify-content-between mt-2" onmouseover="showDeleteAndAddConector(this)" onmouseout="hiddenDeleteAndAddConector(this)">
        <div class="col-4"></div>
        <div class="col-3">
            <label class="col-form-label color_title_add_device" for="connect_addcase" style="width: max-content; font-size: 14px;">
            </label>
        </div>
        <div class="col-4" style="position: relative;">
            <select class="form-select form-select-md connector" list="datalistconnector" name="${name}" aria-label=".form-select-lg example">
                <option value="VGA">VGA</option>
                <option value="DVI">DVI</option>
                <option value="HDMI" selected="">HDMI</option>
                <option value="DisplayPort">DisplayPort</option>
                <option value="Mini-DP">Mini-DP</option>
                <option value="Type-C">Type-C</option>
            </select>
            <i class="fa fa-x i_remove i_remove_connnector text-white d-none" style="right: 7%;" onclick="removeConnector(this,${count})"></i>
        </div>
        <div class="col-1 ps-0 d-flex align-items-end"><button class="btn btn_add btn_add_connnector d-none" onclick="addConnector(this,${count})"><i class="fa fa-plus"></i></button>
        </div>
    </div>`);
}
function showDeleteAndAddRam(e) {
    $($(e).find(".fa-x")).removeClass("d-none")
    $(e).find(".btn_add_ram").removeClass("d-none")
    $(e).find(".btn_add_ram").attr("onclick", "addRam(this)")
    $(e).find("input").css("border-bottom", "2px solid #0085FF");
}
function hiddenDeleteAndAddRam(e) {
    $(e).find(".fa-x").addClass("d-none")
    $(e).find(".btn_add_ram").addClass("d-none")
    $(e).find(".btn_add_ram").removeAttr("onclick")
    $(e).find("input").css("border-bottom", "2px solid #C7C7C7");
}
function showDeleteAndAddHardDrives(e) {
    $($(e).find(".fa-x")).removeClass("d-none")
    $(e).find(".btn_add_hardDrives").removeClass("d-none")
    $(e).find("input").css("border", "2px solid #0085FF");
    $(e).find("select").css("border", "2px solid #0085FF");
}
function hiddenDeleteAndAddHardDrives(e) {
    $(e).find(".fa-x").addClass("d-none")
    $(e).find(".btn_add_hardDrives").addClass("d-none")
    $(e).find("input").css("border", "2px solid #C7C7C7");
    $(e).find("select").css("border", "2px solid #C7C7C7");
}
function showDeleteAndAddVGA(e) {
    $($(e).find(".i_remove_vga")).removeClass("d-none")
    $(e).find(".btn_add_VGA").removeClass("d-none")
}
function hiddenDeleteAndAddVGA(e) {
    $(e).find(".i_remove_vga").addClass("d-none")
    $(e).find(".btn_add_VGA").addClass("d-none")
}
function showDeleteAndAddConector(e) {
    $($(e).find(".i_remove_connnector")).removeClass("d-none")
    $(e).find(".btn_add_connnector").removeClass("d-none")
    event.stopPropagation();
}
function hiddenDeleteAndAddConector(e) {
    $($(e).find(".i_remove_connnector")).addClass("d-none")
    $(e).find(".btn_add_connnector").addClass("d-none")
}
function addRam(e) {
    var lengthInputRam = $("input[name^=ram]").length + 1
    $(e).parent().parent().parent().append(`
    <div class="row justify-content-between mt-2" onmouseover = "showDeleteAndAddRam(this)" onmouseout = "hiddenDeleteAndAddRam(this)">
    <div class="col-3 ">
        <label class="col-form-label color_title_add_device"></label>
    </div>
    <div class="col-8" style="position: relative;">
        <input type="text" name="ram" list="datalistram" autocomplete="off"
            class="form-control" placeholder="Nhập Ram ${lengthInputRam}">
        <div class="invalid-feedback">Vui lòng nhập ram</div>
        <i class="fa fa-x d-none" style="position: absolute; top: 36%; right: 8%; cursor: pointer; font-size: 13px; color: #000000;" onclick="removeRam(this)"></i>
    </div>
    <div class="col-1 ps-0 d-flex align-items-end"><button class="btn btn_add btn_add_ram d-none" id = "addRam"><i
                class="fa fa-plus text-white"></i></button>
    </div>
</div>`);
    autocompleteCreateCase(datacase)
}
function addHardDrives(e) {
    $(e).parent().parent().parent().append(`
        <div class="row justify-content-between mt-2" onmouseover="showDeleteAndAddHardDrives(this)"
            onmouseout="hiddenDeleteAndAddHardDrives(this)">
            <div class="col-3">
                <label for="hardDrives_addCase" class="col-form-label color_title_add_device">
                </label>
            </div>
            <div class="col-3">
                <input type="number" name="size" list="datalistsize" autocomplete="off"
                    class="form-control form_hardDrives" min="0" placeholder="Size"
                    onclick="fomatValueSize(this)" onblur="fomatValue(this)">
                <div class="invalid-feedback" style="width: max-content;">Vui lòng nhập
                    dung lượng</div>
            </div>
            <div class="col-2 p-0">
                <select class="form-select pe-2 ps-2 form_hardDrives" name="type"
                    aria-label="Default select example">
                    <option value="SSD" selected>SSD</option>
                    <option value="HDD">HDD</option>
                    <option value="M2">M2</option>
                </select>
                <div class="invalid-feedback">Vui lòng nhập loại</div>

            </div>
            <div class="col-3" style="position: relative;">
                <input type="text" name="brand" list="datalistbrand" autocomplete="off"
                    class="form-control form_hardDrives" placeholder="Brand">
                <div class="invalid-feedback">Vui lòng nhập hãng</div>
                <i class="fa fa-x i_remove text-white d-none" onclick="removeHardDrives(this)"></i>

            </div>
            <div class="col-1 ps-0 d-flex align-items-end"><button
                    class="btn btn_add btn_add_hardDrives d-none" onclick="addHardDrives(this)"><i
                        class="fa fa-plus text-white"></i></button>
            </div>
        </div>`);
}
function addVGA(e) {
    var count = $("input[name^=vga]").length;
    var name = `connector_${count}`
    $(e).parent().parent().parent().append(`
    <div class="row justify-content-between mt-3" onmouseover="showDeleteAndAddVGA(this)"
    onmouseout="hiddenDeleteAndAddVGA(this)">
    <div class="col-3">
        <label class="col-form-label color_title_add_device" for="VGA_addcase">
        </label>
    </div>
    <div class="col-5" style="position: relative;"> 
        <input type="text" id="VGA_addcase" name="vga" autocomplete="off"
            list="datalistvga" class="form-control" placeholder="Nhập VGA">
        <div class="invalid-feedback">Vui lòng nhập VGA</div>
        <div class="circle_VGA"></div>
    </div>
    <div class="col-3" style="position: relative;">
        <input type="number" autocomplete="off" id="VRAM_addcase" name="vram"
            onclick="fomatValueVram(this)" onblur="fomatValueVramGB(this)"
            list="datalistvram" class="form-control" placeholder="VRAM">
        <div class="invalid-feedback">Vui lòng nhập VRAM</div>
        <i class="fa fa-x i_remove_vga d-none"
            style="position: absolute; top: 36%; right: 8%; cursor: pointer; font-size: 13px; color: #000000;"
            onclick="removeVGA(this,${count})">
        </i>
    </div>
    <div class="col-1 ps-0 d-flex align-items-end"><button
            class="btn btn_add btn_add_VGA" onclick="addVGA(this)"><i
                class="fa fa-plus text-white"></i></button>
    </div>
    <div class="col-12 mt-3">
        <div class="row justify-content-between" onmouseover="showDeleteAndAddConector(this)"
        onmouseout="hiddenDeleteAndAddConector(this)">
            <div class="col-4"></div>
            <div class="col-3">
                <label class="col-form-label color_title_add_device"
                    for="connect_addcase"
                    style="width: max-content; font-size: 14px;">Cổng kết nối:
                </label>
            </div>
            <div class="col-4" style="position: relative;">
                <select class="form-select form-select-md connector"
                    list="datalistconnector" name="${name}"
                    aria-label=".form-select-lg example">
                    <option value="VGA">VGA</option>
                    <option value="DVI">DVI</option>
                    <option value="HDMI" selected>HDMI</option>
                    <option value="DisplayPort">DisplayPort</option>
                    <option value="Mini-DP">Mini-DP</option>
                    <option value="Type-C">Type-C</option>
                </select>
                <i class="fa fa-x i_remove i_remove_connnector text-white d-none" style="right: 7%;"
                    onclick="removeConnector(this,${count})">
                </i>
            </div>
            <div class="col-1 ps-0 d-flex align-items-end"><button
                    class="btn btn_add btn_add_connnector d-none"
                    onclick="addConnector(this,${count})"><i class="fa fa-plus"></i></button>
            </div>
        </div>
    </div>
</div>`);
    autocompleteCreateCase(datacase)
}
function removeHardDrives(e) {
    var lengthHardDrive = $("input[name^=size]").length
    if (lengthHardDrive > 1) {
        $(e).parent().parent().remove()
        $("input[name^=size").eq(0).parent().parent().find("label").eq(0).text("Ổ cứng: ")
    }
}

function removeVGA(e, num) {
    var countVGACurrent = $("input[name^=vga]").length;
    if (countVGACurrent > 1) {
        $(e).parent().parent().remove()
        var count = $("input[name^=vga]").length;
        for (let i = 0; i < count; i++) {
            $(".btn_add_connnector").eq(i).attr("onclick", `addConnector(this,${i})`);
        }
        for (let i = num + 1; i <= count; i++) {
            let selectElements = $(`select[name^=connector_${i}]`);
            let selectCount = selectElements.length;
            for (let j = 0; j < selectCount; j++) {
                let selectElement = selectElements.eq(j);
                selectElement.parent().find(".i_remove_connnector").attr("onclick", `removeConnector(this,${i - 1})`)
                selectElement.attr("name", `connector_${i - 1}`);
            }
        }
        $("input[name^=vga").parent().parent().find("label").eq(0).text("VGA: ")
        $("input[name^=vga").eq(0).parent().parent().removeClass("mt-3")
    }
}
function removeConnector(e, count) {
    var lenghtConnector = $(`select[name^=connector_${count}]`).length
    if (lenghtConnector > 1) {
        $(e).parent().parent().remove()
        $(`select[name^=connector_${count}]`).eq(0).parent().parent().find("label").text("Cổng kết nối: ")
    }
}
function removeRam(e) {
    var lengthInputRam = $("input[name^=ram").length;
    if (lengthInputRam > 1) {
        $(e).parent().parent().remove()
        for (let i = 0; i < $("input[name^=ram").length; i++) {
            const element = $("input[name^=ram")[i];
            $(element).attr("placeholder", `Nhập ram ${i + 1}`)
        }
        $("input[name^=ram").eq(0).parent().parent().find("label").eq(0).text("Ram: ")
    }

}

function changeInputNum(data) {
    if (data.length == 0) {
        return 0
    }
    const maxNumObj = data.reduce((prev, current) => {
        return (parseInt(prev.num) > parseInt(current.num)) ? prev : current
    });
    return parseInt(maxNumObj.num)
}

function CreateDataComplete(datacase, dataCreate, dataComplete) {
    const maxNumObj = changeInputNum(datacase)
    for (let i = 1; i <= dataCreate.quantity; i++) {
        dataComplete.push({
            type: "case",
            // name: dataCreate.name,
            attributes: {
                num: parseInt(maxNumObj) + i,
                macAddress: dataCreate.macAddress,
                mainBoard: dataCreate.mainBoard,
                hardDrives: arrhardDrives,
                PSU: dataCreate.PSU,
                ram: dataCreate.ram,
                chipset: dataCreate.chipset,
                VGA: dataCreate.VGA,
            },
            supplier: dataCreate.supplier,
            location: {
                address: "461 Vũ Tông Phan",
                floor: "Tầng 4"
            },
            expirationDate: dataCreate.expirationDate,
            totalPrice: parseFloat(dataCreate.totalPrice.replace(/,/g, '')),
            billPrice: parseFloat(dataCreate.billPrice.replace(/,/g, '')),
            note: dataCreate.note
        })
    }
    tablePreview(dataComplete)
}

function compare(a, b) {
    if (a.num < b.num) {
        return -1;
    }
    if (a.num > b.num) {
        return 1;
    }
    return 0;
}
function changeNumDevice(num) {
    $(`#numPreview_${num}`).removeAttr("onclick")
    $(`#numPreview_${num}`).html(`<input type="number" id = "inputNumPreview" class = "form-control ps-4" value = ${num} onblur = "changeNumDeviceInDataCreate(this,${num})">`)
    $("#inputNumPreview").select()
}
function changeNumDeviceInDataCreate(e, num) {
    var check = true
    dataComplete.forEach((el) => {
        if (el.attributes.num == parseInt($(e).val())) {
            check = false
        }
    })
    if (check) {
        $(`#numPreview_${num}`).html(`${$(e).val()}`)
        $(`#numPreview_${num}`).attr("onclick", `changeNumDevice(${$(e).val()})`)
        $(`#numPreview_${num}`).attr("id", `numPreview_${$(e).val()}`)
        dataComplete.forEach((el) => {
            if (el.attributes.num == num) {
                el.attributes.num = $(e).val()
            }
        })
    }
    else {
        Swal.fire({
            title: "Thông báo!",
            text: `Đã tồn tại số máy ${$(e).val()}`,
            icon: "error",
            confirmButtonText: "OK",
        }).then(() => {
            $(`#numPreview_${num}`).html(`${num}`)
            $(`#numPreview_${num}`).attr("onclick", `changeNumDevice(${num})`)
        })
    }
}
function tablePreview(dataComplete) {
    dataComplete.sort(compare)
    var htmlCheckInput = ''
    dataComplete.forEach((elm) => {
        htmlCheckInput += `<tr>
                        <td class = "text-center col" id = "numPreview_${elm.attributes.num}" onclick = "changeNumDevice(${elm.attributes.num})">${elm.attributes.num}</td>
                        <td>${elm.attributes.chipset}</td>
                        <td>`
        elm.attributes.ram.forEach((el) => {
            htmlCheckInput += `<div>${el}</div>`
        })
        htmlCheckInput += `</td>
                        <td>`
        elm.attributes.hardDrives.forEach((el) => {
            htmlCheckInput += `<div>${el.size} ${el.type}</div>`
        })
        htmlCheckInput += `</td>`
        htmlCheckInput += `<td>`
        elm.attributes.VGA.forEach((el) => {
            htmlCheckInput += `
                    <div>${el.name} ${el.vram} <br> `
            el.connector.forEach((elm, i) => {
                if (i == el.connector.length - 1) {
                    htmlCheckInput += `${elm}`
                } else {
                    htmlCheckInput += `${elm}, `
                }
            })
            htmlCheckInput += `</div>`
        })
        htmlCheckInput += `</td>`
        htmlCheckInput += `
                        <td>${ObjSupplier[elm.supplier]}</td>
                        <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(elm.billPrice)}</td>
                        <td>
                            <a onclick = "editData('${elm.attributes.num}')">
                                <i class="fa fa-edit text-primary"
                                    style="font-size: 2rem ;">
                                </i>
                            </a>
                        </td>
                        <td>
                            <a onclick = "deleteData('${elm.attributes.num}')">
                                <i class="fa fa-trash text-danger"
                                    style="font-size: 2rem ;">
                                </i>
                            </a>
                        </td>
                    </tr>`
    })
    $("#dataCreate").html(htmlCheckInput)
}

function save_edit(num, e) {
    if (validateInput()) {
        for (let i = 0; i < dataComplete.length; i++) {
            if (num == dataComplete[i].attributes.num) {
                arrRAM = [];
                arrVGAandConnector = [];
                arrhardDrives = []
                getValueInput()
                dataComplete[i] = {
                    type: "case",
                    attributes: {
                        num: parseInt($("#_id_addcase").val()),
                        macAddress: $("#mac_address_addcase").val(),
                        mainBoard: $("#main_board_addcase").val(),
                        hardDrives: arrhardDrives,
                        PSU: $("#PSU_addcase").val(),
                        ram: arrRAM,
                        chipset: $("#chipset_addcase").val(),
                        VGA: arrVGAandConnector,
                    },
                    location: {
                        address: "461 Vũ Tông Phan",
                        floor: "Tầng 4"
                    },
                    supplier: $("#supplier_addcase").val(),
                    expirationDate: $("#expirationDate").val(),
                    totalPrice: parseFloat($("#total_price").val().replace(/,/g, '')),
                    billPrice: parseFloat($("#bill_price").val().replace(/,/g, '')),
                    note: $("#note_addcase").val()
                }
                $("#input_case").css("display", "none")
                $("#table_preview").css("display", "")
                $(e).parent().parent().remove()
                tablePreview(dataComplete)
            }
        }
    }

}

function cancel() {
    location.reload()
}

function renderHtmlAddCase(arrRam, arrHardDrives, arrVGA) {
    var htmlRam = ''
    arrRam.forEach((ram, i) => {
        htmlRam += `<div class="row justify-content-between" onmouseover = "showDeleteAndAddRam(this)" onmouseout = "hiddenDeleteAndAddRam(this)">
        <div class="col-3 ">
            <label class="col-form-label color_title_add_device">${i == 0 ? "Ram: " : ""}</label>
        </div>
        <div class="col-8" style="position: relative;">
            <input type="text" name="ram" list="datalistram" autocomplete="off"
                class="form-control" placeholder="Nhập Ram 1">
            <div class="invalid-feedback">Vui lòng nhập ram</div>
            <i class="fa fa-x d-none" style="position: absolute; top: 36%; right: 8%; cursor: pointer; font-size: 13px; color: #000000;" onclick="removeRam(this)"></i>
        </div>

        <div class="col-1 ps-0 d-flex align-items-end"><button class="btn btn_add d-none btn_add_ram" onclick="addRam(this)"><i
                    class="fa fa-plus text-white"></i></button>
        </div>
    </div>`
    })
    $("#ram").html(htmlRam)
    var inputRAM = $("input[name^=ram]");
    for (i = 0; i < inputRAM.length; i++) {
        let ram = inputRAM[i];
        $(ram).val(arrRam[i])
    }
    var htmlHardDrives = ''
    arrHardDrives.forEach((hardDrives, i) => {
        htmlHardDrives += `<div class="row justify-content-between mt-2" onmouseover="showDeleteAndAddHardDrives(this)"
        onmouseout="hiddenDeleteAndAddHardDrives(this)">
        <div class="col-3">
            <label for="hardDrives_addCase" class="col-form-label color_title_add_device">${i == 0 ? "Ổ cứng:" : ""}</label>
        </div>
        <div class="col-3">
            <input type="number" name="size" list="datalistsize" autocomplete="off"
                class="form-control form_hardDrives" min="0" placeholder="Size"
                onclick="fomatValueSize(this)" onblur="fomatValue(this)">
            <div class="invalid-feedback" style="width: max-content;">Vui lòng nhập
                dung lượng</div>
        </div>
        <div class="col-2 p-0">
            <select class="form-select pe-2 ps-2 form_hardDrives" name="type"
                aria-label="Default select example">
                <option value="SSD" selected>SSD</option>
                <option value="HDD">HDD</option>
                <option value="M2">M2</option>
            </select>
            <div class="invalid-feedback">Vui lòng nhập loại</div>

        </div>
        <div class="col-3" style="position: relative;">
            <input type="text" name="brand" list="datalistbrand" autocomplete="off"
                class="form-control form_hardDrives" placeholder="Brand">
            <div class="invalid-feedback">Vui lòng nhập hãng</div>
            <i class="fa fa-x i_remove text-white d-none" onclick="removeHardDrives(this)"></i>

        </div>
        <div class="col-1 ps-0 d-flex align-items-end"><button
                class="btn btn_add btn_add_hardDrives d-none" onclick="addHardDrives(this)"><i
                    class="fa fa-plus text-white"></i></button>
        </div>
    </div>`
    })
    $("#hardDrives").html(htmlHardDrives)
    var inputSize = $("input[name^=size]");
    var inputType = document.getElementsByName('type')
    var inputBrand = $("input[name^=brand]");
    for (i = 0; i < inputSize.length; i++) {
        inputSize[i].value = parseInt(arrHardDrives[i].size)
        inputType[i].value = arrHardDrives[i].type
        inputBrand[i].value = arrHardDrives[i].brand
        fomatValue(inputSize[i])

    };
    var htmlVGA = '';
    arrVGA.forEach((vga, i) => {
        htmlVGA += `<div class="row justify-content-between mt-3" onmouseover="showDeleteAndAddVGA(this)"
        onmouseout="hiddenDeleteAndAddVGA(this)">
        <div class="col-3">
            <label class="col-form-label color_title_add_device" for="VGA_addcase">VGA:
            </label>
        </div>
        <div class="col-5" style="position: relative;">
            <input type="text" id="VGA_addcase" name="vga" autocomplete="off"
                list="datalistvga" class="form-control" placeholder="Nhập VGA">
            <div class="invalid-feedback">Vui lòng nhập VGA</div>
            <div class="circle_VGA d-none"></div>
        </div>
        <div class="col-3" style="position: relative;">
            <input type="number" autocomplete="off" id="VRAM_addcase" name="vram"
                onclick="fomatValueVram(this)" onblur="fomatValueVramGB(this)"
                list="datalistvram" class="form-control" placeholder="VRAM">
            <div class="invalid-feedback">Vui lòng nhập VRAM</div>
            <i class="fa fa-x i_remove_vga d-none"
                style="position: absolute; top: 36%; right: 8%; cursor: pointer; font-size: 13px; color: #000000;"
                onclick="removeVGA(this,0)"></i>
        </div>
        <div class="col-1 ps-0 d-flex align-items-end"><button
                class="btn btn_add btn_add_VGA" onclick="addVGA(this)"><i
                    class="fa fa-plus text-white"></i></button>
        </div>`
        vga.connector.forEach((connector, index) => {
            htmlVGA += `<div class="col-12 mt-3">
            <div class="row justify-content-between" onmouseover="showDeleteAndAddConector(this)"
            onmouseout="hiddenDeleteAndAddConector(this)">
                <div class="col-4"></div>
                <div class="col-3">
                    <label class="col-form-label color_title_add_device"
                        for="connect_addcase"
                        style="width: max-content; font-size: 14px;">${index == 0 ? "Cổng kết nối:" : ""}
                    </label>
                </div>
                <div class="col-4" style="position: relative;">
                    <select class="form-select form-select-md connector"
                        list="datalistconnector" name="connector_${i}"
                        aria-label=".form-select-lg example">
                        <option value="VGA">VGA</option>
                        <option value="DVI">DVI</option>
                        <option value="HDMI" selected>HDMI</option>
                        <option value="DisplayPort">DisplayPort</option>
                        <option value="Mini-DP">Mini-DP</option>
                        <option value="Type-C">Type-C</option>
                    </select>
                    <i class="fa fa-x i_remove i_remove_connnector text-white d-none" style="right: 7%;"
                        onclick="removeConnector(this,${i})"></i>
                </div>
                <div class="col-1 ps-0 d-flex align-items-end"><button
                        class="btn btn_add btn_add_connnector d-none"
                        onclick="addConnector(this,0)"><i class="fa fa-plus"></i></button>
                </div>
            </div>
        </div>`
        })
        htmlVGA += `</div>`
    })
    $("#vga").html(htmlVGA)
    var inputVGA = $("input[name^=vga]");
    for (i = 0; i < inputVGA.length; i++) {
        let vga = inputVGA[i];
        $(vga).val(arrVGA[i].name)
    }
    var inputVRAM = $("input[name^=vram]");
    for (i = 0; i < inputVRAM.length; i++) {
        let vram = inputVRAM[i];
        $(vram).val(parseInt(arrVGA[i].vram))
        fomatValueVramGB(vram)
        var name = `select[name^=connector_${i}]`
        var inputConnector = $(name);
        for (j = 0; j < inputConnector.length; j++) {
            let connector = inputConnector[j];
            $(connector).val(arrVGA[i].connector[j])
        }
    }
    getValueInput()
}

function editInputAddDevice(currentDevice) {
    $("#_id_addcase").val(currentDevice.attributes.num)
    $("#bill_price").val(parseInt(currentDevice.billPrice))
    $("#total_price").val(parseInt(currentDevice.totalPrice))
    formatCurrency($("#bill_price"))
    formatCurrency($("#total_price"))
    $("#PSU_addcase").val(currentDevice.attributes.PSU)
    $("#main_board_addcase").val(currentDevice.attributes.mainBoard)
    $("#chipset_addcase").val(currentDevice.attributes.chipset)
    $("#mac_address_addcase").val(currentDevice.attributes.macAddress)
    $("#expirationDate").val(currentDevice.expirationDate)
    $("#note_addcase").val(currentDevice.note)
    renderHtmlAddCase(currentDevice.attributes.ram, currentDevice.attributes.hardDrives, currentDevice.attributes.VGA)
    autocompleteCreateCase()
}

function editData(num) {
    $("#table_preview").css("display", "none")
    $("#input_case").css("display", "")
    $("#input_case").append(`<div class="row my-3 justify-content-center">
                <div class="col-11 d-flex justify-content-end pe-0">
                    <button class="btn btn-success px-5" onclick="save_edit(${num},this)" style ="background-color: #04A544;border-radius: 29px;">Lưu</button>
                </div>
                
            </div>`)
    $("#quantity").parent().parent().parent().remove()
    var currentDevice = dataComplete.find(el => el.attributes.num == num)
    editInputAddDevice(currentDevice)
}

function deleteData(num) {
    dataComplete = dataComplete.filter(el => el.attributes.num != num);
    if (dataComplete[0] == null) {
        location.reload()
    } else {
        tablePreview(dataComplete)
    }
}

function validateInput() {
    var check = 1;
    var inputRAM = $("input[name^=ram]");
    for (i = 0; i < inputRAM.length; i++) {
        let el = inputRAM[i];
        if (el.value === '') {
            check = 0;
            $("input[name^=ram]").eq(i).addClass('is-invalid');
        } else {
            $("input[name^=ram]").eq(i).removeClass('is-invalid');
        }
    }

    if ($('#chipset_addcase').val() === '') {
        check = 0;
        $('#chipset_addcase').addClass('is-invalid')
    } else {
        $('#chipset_addcase').removeClass('is-invalid')

    }
    var inputVGA = $("input[name^=vga]");
    for (i = 0; i < inputVGA.length; i++) {
        let el = inputVGA[i];
        if (el.value === '') {
            check = 0;
            $("input[name^=vga]").eq(i).addClass('is-invalid');
        } else {
            $("input[name^=vga]").eq(i).removeClass('is-invalid');
        }
    }
    var inputVRAM = $("input[name^=vram]");
    for (i = 0; i < inputVRAM.length; i++) {
        let el = inputVRAM[i];
        if (el.value == '') {
            check = 0;
            $("input[name^=vram]").eq(i).addClass('is-invalid');
        } else {
            $("input[name^=vram]").eq(i).removeClass('is-invalid');
        }
    }
    if ($('#supplier_addcase').val() === '') {
        check = 0;
        $('#supplier_addcase').addClass('is-invalid')
    } else {
        $('#supplier_addcase').removeClass('is-invalid')

    }
    if ($('#bill_price').val() === '') {
        check = 0;
        $('#bill_price').addClass('is-invalid')
    } else {
        $('#bill_price').removeClass('is-invalid')
    }
    var inputSize = $("input[name^=size]");
    var inputType = document.getElementsByName('type')
    var inputBrand = $("input[name^=brand]");

    for (i = 0; i < inputSize.length; i++) {
        if (inputSize[i].value === '') {
            check = 0;
            $("input[name^=size]").eq(i).addClass('is-invalid')
        } else {
            $("input[name^=size]").eq(i).removeClass('is-invalid')
        }
        if (inputType[i].value === '') {
            check = 0;
            $("inputType").eq(i).addClass('is-invalid')
        } else {
            $("inputType").eq(i).removeClass('is-invalid')
        }
        if (inputBrand[i].value === '') {
            check = 0;
            $("input[name^=brand]").eq(i).addClass('is-invalid')
        } else {
            $("input[name^=brand]").eq(i).removeClass('is-invalid')
        }
    }
    $('input[type="text"]').on('keyup', function () {
        $(this).removeClass('is-invalid');
    });
    $('input[name="size"]').on('keyup', function () {
        $(this).removeClass('is-invalid');
    });
    $('input[name="vram"]').on('keyup', function () {
        $(this).removeClass('is-invalid');
    });
    return check;
}

function create() {
    $.ajax(GVS.setting(GVS.CreateManyDevice, 'POST', {
        devices: dataComplete,
        type: "case"
    })).done(respone => {
        if (respone.success == 1) {
            Swal.fire({
                title: "Thông báo!",
                text: respone.message,
                icon: "success",
                confirmButtonText: "OK",
            }).then((result) => {
                location.reload();
            });
        } else {
            Swal.fire({
                title: "Thông báo!",
                text: respone.message,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    })
}

function deleteInput() {
    $('input').val("")
    $("#expirationDate").val(formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6))))

}