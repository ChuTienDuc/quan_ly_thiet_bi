$(document).ready(() => {
    renderAllUps()
})
var dataUps = [];
var dataComplete = []
var ObjSupplier = {}

function renderOptionSupplier() {
    $.ajax(GVS.setting(GVS.GetAllSupplier, 'GET')).done((res) => {
        var html = ''
        res.metadata.forEach((el) => {
            html += `<option value = "${el._id}">${el.name}</option>`
            ObjSupplier[el._id] = el.name
        })
        $("#supplier_addups").html(html)
    })
}
let arrSortWithStatus = [0, 1, -1]

function renderAllUps() {
    $.ajax(GVS.setting(GVS.GetAllDeciveByType, "POST", {
        type: "ups"
    })).done((res) => {
        if (res.success == 1) {
            var data = res.metadata
            var datas
            // let arr = datas
            datas = renderDeviceByStatus(data, datas)
            sortArrayByAnotherArray(datas, arrSortWithStatus, 'status')
            datas.forEach(el => {
                dataUps.push({
                    _id: el._id,
                    name: el.name,
                    num: parseInt(el.attributes.num),
                    PSU: el.attributes.PSU,
                    capacity: el.attributes.capacity,
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
            renderTableMain(dataUps)
            $("#table_ups").DataTable({
                "pageLength": 50,
                lengthMenu: [20, 40, 50, 100, 200, 500],
            })
            autoCompleteInput("billPrice", "datalistbillprice", dataUps)
            autoCompleteInput("name", "datalistname", dataUps)
            autoCompleteInput("PSU", "datalistpsu", dataUps)
            autoCompleteInput("capacity", "datalistcapacity", dataUps)
            $('#preview').click(() => {
                if (validateInput() == 0) {
                    validateInput();
                } else {
                    $("#_id_ups").parent().parent().parent().css("display", "")
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
                    $("#input_ups").css("display", "none")
                    var dataCreateUps = {
                        quantity: $("#quantity").val(),
                        name: $("#name_addups").val(),
                        PSU: $("#psu_addups").val(),
                        capacity: $("#capacity_addups").val(),
                        supplier: $("#supplier_addups").val(),
                        expirationDate: $("#expirationDate").val(),
                        totalPrice: $("#total_price").val(),
                        billPrice: $("#bill_price").val(),
                        note: $("#note_addups").val()
                    }
                    CreateDataComplete(dataUps, dataCreateUps, dataComplete)

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

function CreateDataComplete(dataups, dataCreate, dataComplete) {
    const maxNum = changeInputNum(dataups)
    for (let i = 1; i <= dataCreate.quantity; i++) {
        dataComplete.push({
            type: "ups",
            name: dataCreate.name,
            attributes: {
                num: parseInt(maxNum) + i,
                PSU: dataCreate.PSU,
                capacity: dataCreate.capacity
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

function renderTableMain(dataUps) {
    var statusChange = {
        "0": "Using",
        "-1": "Error",
        "1": "Free"
    }
    var html = ''
    // dataUps.sort(compare)
    dataUps.forEach(ups => {
        if (ups.status == -1) {
            html += `<tr class= "align-middle text-center" style = "background-color:#faaaaa">`
        } else if (ups.status == 1) {
            html += `<tr class= "align-middle text-center" style = "background-color: #fffeb6bf">`
        } else {
            html += `<tr class= "align-middle text-center">`
        }
        html += `<td class = "p-0">
                <a href = "/api/device/details/${ups._id}"
                <i class='fa fa-eye c-purple text-decoration-none'  style ="font-size: 1rem ;" ></i>
                </a>
            </td>
            <td>${ups.num}</td>
            <td>${ups.name}</td>
            <td>${ups.PSU}</td>
            <td>${ups.capacity}</td>`
        html += `</td>
                    <td>${ups.billPrice != null ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ups.billPrice)}` : ""}</td>
                    <td>${statusChange[ups.status]}</td>
                    <td>${ups.supplier ? ups.supplier.name : ''}</td>
                    <td>${ups.location.address}</td>
                    <td>${ups.location.floor}</td>
                    <td> ${ups.createdAt != null ? `${new Date(ups.createdAt).toLocaleDateString('vi-VN')}` : ""}</td>
                    <td>${ups.expirationDate != null ? `${new Date(ups.expirationDate).toLocaleDateString('vi-VN')}` : ""}</td>
                    <td>${ups.note}</td>
                    </tr >`
    });
    $("#content_table").html(html)
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
                            <td class = "text-center col" id = "numPreview_${elm.attributes.num}" onclick = "changeNumDevice(${elm.attributes.num})">${elm.attributes.num}</td>`
        htmlCheckInput += `<td>${elm.attributes.PSU}</td>`
        htmlCheckInput += `<td>${elm.attributes.capacity}</td>`
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
    $("#input_ups").css("display", "")
    $("#input_ups").append(`<div class="row my-3 justify-content-center">
                <div class="col-11 d-flex justify-content-end pe-0">
                    <button class="btn btn-success px-5" onclick="save_edit('${num}',this)" style ="background-color: #04A544;
                    border-radius: 29px;">Lưu</button>
                </div>
            </div>`)
    $("#quantity").parent().parent().parent().remove()
    var currentDevice = dataComplete.find(el => el.attributes.num == num)
    $("#_id_ups").val(currentDevice.attributes.num)
    $("#name_addups").val(currentDevice.name)
    $("#psu_addups").val(currentDevice.attributes.PSU)
    $("#capacity_addups").val(currentDevice.attributes.capacity)
    $("#supplier_addups").val(currentDevice.supplier)
    $("#bill_price").val(parseInt(currentDevice.billPrice))
    $("#total_price").val(parseInt(currentDevice.totalPrice))
    $("#expirationDate").val(currentDevice.expirationDate)

    formatCurrency($("#bill_price"))
    formatCurrency($("#total_price"))
}

function save_edit(num, e) {
    for (let i = 0; i < dataComplete.length; i++) {
        if (num == dataComplete[i].attributes.num) {
            dataComplete[i] = {
                type: "ups",
                name: $("#name_addups").val(),
                attributes: {
                    num: parseInt($("#_id_ups").val()),
                    PSU: $("#psu_addups").val(),
                    capacity: $("#capacity_addups").val(),
                },
                location: {
                    address: "461 Vũ Tông Phan",
                    floor: "Tầng 4"
                },
                supplier: $("#supplier_addups").val(),
                expirationDate: $("#expirationDate").val(),
                totalPrice: parseFloat($("#total_price").val().replace(/,/g, '')),
                billPrice: parseFloat($("#bill_price").val().replace(/,/g, '')),
                note: $("#note_addups").val()
            }
            $("#input_ups").css("display", "none")
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

    $('#supplier_addups').focusin(() => {
        $('#supplier_addups').removeClass('is-invalid')
    })
    $('#bill_price').focusin(() => {
        $('#bill_price').removeClass('is-invalid')
    })
    $('#name_addups').focusin(() => {
        $('#name_addups').removeClass('is-invalid')
    })
    if ($('#supplier_addups').val() === '') {
        check = 0;
        $('#supplier_addups').addClass('is-invalid')
    } else {

        $('#supplier_addups').removeClass('is-invalid')

    }
    if ($('#bill_price').val() === '') {
        check = 0;
        $('#bill_price').addClass('is-invalid')
    } else {

        $('#bill_price').removeClass('is-invalid')
    }
    if ($('#name_addups').val() === '') {
        check = 0;
        $('#name_addups').addClass('is-invalid')
    } else {
        $('#name_addups').removeClass('is-invalid')
    }
    if ($('#psu').val() === '') {
        check = 0;
        $('#psu').addClass('is-invalid')
    } else {
        $('#psu').removeClass('is-invalid')
    }
    if ($('#capacity').val() === '') {
        check = 0;
        $('#capacity').addClass('is-invalid')
    } else {
        $('#capacity').removeClass('is-invalid')
    }
    return check
}

function cancel() {
    location.reload()
}

function create() {
    $.ajax(GVS.setting(GVS.CreateManyDevice, "POST", {
        devices: dataComplete,
        type: "ups"
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
}

function deleteInput() {
    $('input').val("")
    $("#expirationDate").val(formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6))))

}
$(document).ready(() => {
    $("#table_preview").css("display", "none")
    $("#_id_ups").parent().parent().parent().css("display", "none")
})