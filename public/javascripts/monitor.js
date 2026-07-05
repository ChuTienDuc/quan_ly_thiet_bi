$(document).ready(() => {
    renderAllMonitor()
})
var dataMonitor = [];
var dataComplete = []
var ObjSupplier = {}

function renderOptionSupplier() {
    $.ajax(GVS.setting(GVS.GetAllSupplier, 'GET')).done((res) => {
        var html = ''
        res.metadata.forEach((el) => {
            html += `<option value = "${el._id}">${el.name}</option>`
            ObjSupplier[el._id] = el.name
        })
        $("#supplier_addmonitor").html(html)
    })
}
let arrSortWithStatus = [0, 1, -1]

function renderAllMonitor() {
    $.ajax(GVS.setting(GVS.GetAllDeciveByType, "POST", {
        type: "monitor"
    })).done((res) => {
        if (res.success == 1) {
            var data = res.metadata
            var datas
            // let arr = datas
            datas = renderDeviceByStatus(data, datas)
            sortArrayByAnotherArray(datas, arrSortWithStatus, 'status')
            datas.forEach(el => {
                dataMonitor.push({
                    _id: el._id,
                    name: el.name,
                    num: parseInt(el.attributes.num),
                    connector: el.attributes.connector,
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
            renderTableMain(dataMonitor)
            $("#table_monitor").DataTable({
                "pageLength": 50,
                lengthMenu: [20, 40, 50, 100, 200, 500],
            })
            autoCompleteInput("billPrice", "datalistbillprice", dataMonitor)
            autoCompleteInput("name", "datalistname", dataMonitor)
            $('#preview').click(() => {
                if (validateInput() == 0) {
                    validateInput();
                } else {
                    $("#_id_monitor").parent().parent().parent().css("display", "")
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
                    $("#input_monitor").css("display", "none")
                    getValueInput();
                    var dataCreateMonitor = {
                        // num: $("#_id_monitor").val(),
                        quantity: $("#quantity").val(),
                        name: $("#name_addmonitor").val(),
                        connector: arrConnector,
                        supplier: $("#supplier_addmonitor").val(),
                        expirationDate: $("#expirationDate").val(),
                        totalPrice: $("#total_price").val(),
                        billPrice: $("#bill_price").val(),
                        note: $("#note_addmonitor").val()
                    }
                    CreateDataComplete(dataMonitor, dataCreateMonitor, dataComplete)

                    $("#preview").parent().parent().css("display", "none")
                }
            })
        } else {
            Swal.fire({
                title: "Thông báo!",
                text: res.message,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    })
}

function changeInputNum(data) {
    if (data.length == 0) {
        return 0
    }
    const maxNumObj = data.reduce((prev, current) => {
        return (prev.num > current.num) ? prev : current
    });
    return parseInt(maxNumObj.num)
}

function CreateDataComplete(datamonitor, dataCreate, dataComplete) {
    const maxNum = changeInputNum(datamonitor)
    for (let i = 1; i <= dataCreate.quantity; i++) {
        dataComplete.push({
            type: "monitor",
            name: dataCreate.name,
            attributes: {
                num: parseInt(maxNum) + i,
                connector: dataCreate.connector
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

function renderTableMain(dataMonitor) {
    var statusChange = {
        "0": "Đang sử dụng",
        "-1": "Đã hỏng",
        "1": "Có thể sử dụng"
    }
    var html = ''
    // dataMonitor.sort(compare)
    dataMonitor.forEach(monitor => {
        if (monitor.status == -1) {
            html += `<tr class= "align-middle text-center" style = "background-color:#faaaaa">`
        } else if (monitor.status == 1) {
            html += `<tr class= "align-middle text-center" style = "background-color: #fffeb6bf">`
        } else {
            html += `<tr class= "align-middle text-center">`
        }
        html += `<td class = "p-0">
                <a href = "/api/device/details/${monitor._id}"
                <i class='fa fa-eye c-purple text-decoration-none'  style ="font-size: 1rem ;" ></i>
                </a>
            </td>
            <td>${monitor.num}</td>
            <td>${monitor.name}
                <td>`
        monitor.connector.forEach(connector => {
            html += `<div>${connector}</div>`
        });
        html += `</td>
                    <td>${monitor.billPrice != null ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(monitor.billPrice)}`: ""}</td>
                    <td>${statusChange[monitor.status]}</td>
                    <td>${monitor.supplier ? monitor.supplier.name : ''}</td>
                    <td>${monitor.location? monitor.location.address : ""}</td>
                    <td>${monitor.location ? monitor.location.floor : ""}</td>
                    <td> ${monitor.createdAt != null ? `${new Date(monitor.createdAt).toLocaleDateString('vi-VN')}`: ""}</td>
                    <td>${monitor.expirationDate != null ? `${new Date(monitor.expirationDate).toLocaleDateString('vi-VN')}`: ""}</td>
                    <td>${monitor.note}</td>
                    </tr >`
    });
    $("#content_table").html(html)
}
//! Add Connector
function addConnector(e) {
    var lenghtConnector = $("select.connector_monitor").length
    $(e).parent().parent().parent().append(`
         <div class="row justify-content-center" onmouseover="showDeleteAndAddConnector(this)"
         onmouseout="hiddenDeleteAndAddConnector(this)">
             <div class="col-3 ">
                 <label class="col-form-label" for="connect_addmonitor"></label>
             </div>
             <div class="col-6 mb-2">
                <select class="form-select form-select-md connector_monitor"
                    name="connector_${lenghtConnector}" aria-label=".form-select-lg example">
                    <option value="VGA">VGA</option>
                    <option value="DVI">DVI</option>
                    <option value="HDMI" selected>HDMI</option>
                    <option value="DisplayPort">DisplayPort</option>
                    <option value="Mini-DP">Mini-DP</option>
                    <option value="Type-C">Type-C</option>
                </select>
             </div>
             <div class="col-1 ps-0 d-flex">
                <button class="btn btn_add btn_add_connnector mt-2 d-none" onclick="addConnector(this)"><i class="fa fa-plus"></i>
                </button>
                <i class="fa fa-x d-flex align-items-center mt-1 ms-2 d-none" onclick = "removeConnector(this)" style="cursor: pointer;"></i>
            </div>
         </div>`);
}

function showDeleteAndAddConnector(e) {
    $(e).find(".fa-x").removeClass("d-none")
    $(e).find(".btn_add_connnector").removeClass("d-none")
}

function hiddenDeleteAndAddConnector(e) {
    $(e).find(".fa-x").addClass("d-none")
    $(e).find(".btn_add_connnector").addClass("d-none")
}
//! TODO removeAdd
function removeConnector(e) {
    var lenghtConnectorPrev = $("select.connector_monitor").length
    if (lenghtConnectorPrev > 1) {
        $(e).parent().parent().remove()
        var lenghtConnectorCurrent = $("select.connector_monitor").length
        for (let i = 0; i < lenghtConnectorCurrent; i++) {
            $("select.connector_monitor").eq(i).attr("name", `connector_${i}`)
        }
    }
}
var arrConnector = [];

function getValueInput() {
    // TODO input Connector
    var lenghtConnector = $("select.connector_monitor").length
    for (let index = 0; index <= lenghtConnector; index++) {
        var name = `select[name^=connector_${index}]`
        var inputConnector = $(name);
        for (i = 0; i < inputConnector.length; i++) {
            let el = inputConnector[i];
            arrConnector.push(el.value);
        }
    }
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
    $(`#numPreview_${num}`).html(`<input type="number" id = "inputNumPreview" class = "form-control ps-3" value = ${num} onblur = "changeNumDeviceInDataCreate(this,${num})">`)
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
    } else {
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
    dataComplete.forEach((elm, index) => {
        htmlCheckInput += `<tr>
                            <td class = "text-center col" id = "numPreview_${elm.attributes.num}" onclick = "changeNumDevice(${elm.attributes.num})">${elm.attributes.num}</td>
                        <td>`
        elm.attributes.connector.forEach((el) => {
            htmlCheckInput += `<div class = "text-center">${el}</div>`
        })
        htmlCheckInput += `</td>`
        htmlCheckInput += `<td>${elm.name}</td>`
        htmlCheckInput += `
                        <td>${ObjSupplier[elm.supplier]}</td>
                        <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(elm.billPrice)}</td>
                        <td>
                            <a onclick = "editData(${elm.attributes.num})">
                                <i class="bx bxs-edit text-primary"
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

function editData(num) {
    $("#table_preview").css("display", "none")
    $("#input_monitor").css("display", "")
    $("#input_monitor").append(`<div class="row my-3 justify-content-center">
                <div class="col-11 d-flex justify-content-end pe-0">
                    <button class="btn btn-success px-5" onclick="save_edit('${num}',this)" style ="background-color: #04A544;
                    border-radius: 29px;">Lưu</button>
                </div>
            </div>`)
    $("#quantity").parent().parent().parent().remove()
    var currentDevice = dataComplete.find(el => el.attributes.num == num)
    $("#_id_monitor").val(currentDevice.attributes.num)
    $("#supplier_addmonitor").val(currentDevice.supplier)
    $("#bill_price").val(parseInt(currentDevice.billPrice))
    $("#total_price").val(parseInt(currentDevice.totalPrice))
    $("#expirationDate").val(currentDevice.expirationDate)

    var connector = $("select.connector")

    for (let i = 0; i < connector.length; i++) {
        const element = connector[i];
        element.value = currentDevice.attributes.connector[i]
    }

    formatCurrency($("#bill_price"))
    formatCurrency($("#total_price"))
}

function save_edit(num, e) {
    for (let i = 0; i < dataComplete.length; i++) {
        if (num == dataComplete[i].attributes.num) {
            arrConnector = []
            getValueInput()
            dataComplete[i] = {
                type: "monitor",
                name: $("#name_addmonitor").val(),
                attributes: {
                    num: parseInt($("#_id_monitor").val()),
                    connector: arrConnector,
                },
                location: {
                    address: "461 Vũ Tông Phan",
                    floor: "Tầng 4"
                },
                supplier: $("#supplier_addmonitor").val(),
                expirationDate: $("#expirationDate").val(),
                totalPrice: parseFloat($("#total_price").val().replace(/,/g, '')),
                billPrice: parseFloat($("#bill_price").val().replace(/,/g, '')),
                note: $("#note_addmonitor").val()
            }
            $("#input_monitor").css("display", "none")
            $("#table_preview").css("display", "")
            $(e).parent().parent().remove()
            tablePreview(dataComplete)
        }
    }
}

function deleteData(num) {
    dataComplete = dataComplete.filter(el => el.attributes.num != num);
    if (dataComplete[0] == null) {
        location.reload();
    } else {
        tablePreview(dataComplete)
    }
}

function validateInput() {
    var check = 1;

    $('#supplier_addmonitor').focusin(() => {
        $('#supplier_addmonitor').removeClass('is-invalid')
    })
    $('#bill_price').focusin(() => {
        $('#bill_price').removeClass('is-invalid')
    })
    $('#name_addmonitor').focusin(() => {
        $('#name_addmonitor').removeClass('is-invalid')
    })
    if ($('#supplier_addmonitor').val() === '') {
        check = 0;
        $('#supplier_addmonitor').addClass('is-invalid')
    } else {

        $('#supplier_addmonitor').removeClass('is-invalid')

    }
    if ($('#bill_price').val() === '') {
        check = 0;
        $('#bill_price').addClass('is-invalid')
    } else {

        $('#bill_price').removeClass('is-invalid')
    }
    if ($('#name_addmonitor').val() === '') {
        check = 0;
        $('#name_addmonitor').addClass('is-invalid')
    } else {
        $('#name_addmonitor').removeClass('is-invalid')

    }
    return check
}

function cancel() {
    location.reload()
}

function create() {
    $.ajax(GVS.setting(GVS.CreateManyDevice, "POST", {
        devices: dataComplete,
        type: "monitor"
    })).done((respone) => {
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
    // $.ajax({
    //     url: GVS.CreateManyDevice,
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     data: JSON.stringify({
    //         devices: dataComplete
    //     }),
    //     success: (respone) => {
    //         if (respone.success == 1) {
    //             Swal.fire({
    //                 title: "Thông báo!",
    //                 text: respone.message,
    //                 icon: "success",
    //                 confirmButtonText: "OK",
    //             }).then((result) => {
    //                 location.reload();
    //             });
    //         } else {
    //             Swal.fire({
    //                 title: "Thông báo!",
    //                 text: respone.message,
    //                 icon: "error",
    //                 confirmButtonText: "OK",
    //             });
    //         }
    //     }
    // })

}

function deleteInput() {
    $('input').val("")
    $("#expirationDate").val(formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6))))

}
$(document).ready(() => {
    $("#table_preview").css("display", "none")
    $("#_id_monitor").parent().parent().parent().css("display", "none")
})