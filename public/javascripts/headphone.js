$(document).ready(() => {
    renderAllHeadphone()
})
var dataHeadphone = []
var dataComplete = []
var ObjSupplier = {}

function renderOptionSupplier() {
    $.ajax(GVS.setting(GVS.GetAllSupplier, 'GET')).done(res => {
        var html = ''
        res.metadata.forEach((el) => {
            html += `<option value = "${el._id}">${el.name}</option>`
            ObjSupplier[el._id] = el.name
        })
        $("#supplier_addheadphone").html(html)
    })
}
let arrSortWithStatus = [0, 1, -1]

function renderAllHeadphone() {
    $.ajax(GVS.setting(GVS.GetAllDeciveByType, 'POST', {
        type: 'headphone'
    })).done(res => {
        if (res.success == 1) {
            var data = res.metadata
            var datas
            // let arr = datas
            datas = renderDeviceByStatus(data, datas)
            sortArrayByAnotherArray(datas, arrSortWithStatus, 'status')
            datas.forEach((el) => {
                dataHeadphone.push({
                    _id: el._id,
                    name: el.name,
                    num: el.attributes.num,
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
            renderTableMain(dataHeadphone)
            $("#table_headphone").DataTable({
                "pageLength": 50,
                lengthMenu: [20, 40, 50, 100, 200, 500],
            })
            autoCompleteInput("billPrice", "datalistbillprice", dataHeadphone)
            autoCompleteInput("totalPrice", "datalisttotalprice", dataHeadphone)
            autoCompleteInput("name", "datalistname", dataHeadphone)
            $('#preview').click(() => {
                if (validateInput() == 0) {
                    validateInput();
                } else {
                    validateInput();
                    $("#table_preview").css("display", "")
                    $("#table_preview").append(`<div class="justify-content-center text-center mb-3 row p-0" id="action">
                                <div class="col-1" style="width: max-content;">
                                    <button type="button" onclick="create()" class="btn btn-success px-4" style = "border-radius: 29px;
                                    background-color: #04A544;">
                                        Đồng ý
                                    </button>
                                </div>
                                <div class="col-1 ps-0">
                                    <button type="button" data-bs-dismiss="modal" aria-label="Close" onclick = "cancel()" class="btn btn-danger" style = "background-color: #F81111;border-radius: 29px;padding-left: 45%;padding-right: 45%;">
                                        Hủy
                                    </button>
                                </div>
                            </div>`)
                    $("#input_headphone").css("display", "none")

                    var dataCreate = {
                        quantity: $("#quantity").val(),
                        name: $("#name_addheadphone").val(),
                        num: $("#_id_addheadphone").val(),
                        supplier: $("#supplier_addheadphone").val(),
                        expirationDate: $("#expirationDate").val(),
                        totalPrice: $("#total_price").val(),
                        billPrice: $("#bill_price").val(),
                        note: $("#note_addheadphone").val()
                    }
                    $("#preview").parent().parent().css("display", "none")
                }
                CreateDataComplete(dataHeadphone, dataCreate, dataComplete)
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


function renderTableMain() {
    var html = ''
    var statusChange = {
        "0": "Đang sử dụng",
        "-1": "Đã hong",
        "1": "Có thể sử dụng"
    }

    dataHeadphone.forEach(headphone => {
        if (headphone.status == -1) {
            html += `<tr class= "align-middle text-center " style = "background-color:#faaaaa">`
        } else if (headphone.status == 1) {
            html += `<tr class= "align-middle text-center" style = "background-color: #fffeb6bf">`
        } else {

            html += `<tr class= "align-middle text-center">`
        }
        html += `
        <td class = "p-0">
            <a class ="text-decoration-none" href="/api/device/details/${headphone._id}">
            <i class='fa fa-eye c-purple ' style ="font-size: 1rem;" ></i>
            </a>
        </td>
        <td>${headphone.num}
        <td>${headphone.name}
        <td>${headphone.billPrice != null ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(headphone.billPrice)}`: ""}</td>
        <td>${headphone.supplier ? headphone.supplier.name : ""}</td>
        <td>${statusChange[headphone.status]}</td>
        <td>${headphone.location? headphone.location.address : ""}</td>
        <td>${headphone.location ? headphone.location.floor : ""}</td>
        <td> ${headphone.createdAt != null ? `${new Date(headphone.createdAt).toLocaleDateString('vi-VN')}`: ""}</td>
        <td>${headphone.expirationDate != null ? `${new Date(headphone.expirationDate).toLocaleDateString('vi-VN')}`: ""}</td>
        <td>${headphone.note}</td>
        </tr >`
    });
    $("#headphone_table").html(html)
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
    var htmlCheckInput = ''
    dataComplete.forEach((elm) => {
        htmlCheckInput += `<tr>
                        <td class = "text-center col" id = "numPreview_${elm.attributes.num}" onclick = "changeNumDevice(${elm.attributes.num})">${elm.attributes.num}</td>
                        <td>${elm.name}</td>
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
                            <a onclick = "deleteData(${elm.attributes.num})">
                                <i class="fa fa-trash text-danger"
                                    style="font-size: 2rem ;">
                                </i>
                            </a>
                        </td>
                    </tr>`
    })
    $("#dataCreate").html(htmlCheckInput)

}

function cancel() {
    location.reload()
}

function editData(num) {
    $("#_id_addheadphone").parent().parent().parent().css("display", "")
    $("#table_preview").css("display", "none")
    $("#input_headphone").css("display", "")
    $("#input_headphone").append(`<div class="row my-3 justify-content-center">
                <div class="col-11 d-flex justify-content-end pe-0">
                    <button class="btn btn-success px-5" onclick="save_edit(${num},this)" style ="background-color: #04A544;
                    border-radius: 29px;">Lưu</button>
                </div>
            </div>`)
    var currentDevice = dataComplete.find(el => el.attributes.num == num)

    $("#_id_addheadphone").val(currentDevice.attributes.num)
    $("#name_addheadphone").val(currentDevice.name)
    $("#supplier_addheadphone").val(currentDevice.supplier)
    $("#bill_price").val(currentDevice.billPrice)
    $("#total_price").val(parseInt(currentDevice.totalPrice))
    $("#expirationDate").val(currentDevice.expirationDate)
    formatCurrency($("#bill_price"))
    formatCurrency($("#total_price"))
    $("#quantity").parent().parent().parent().remove()
}

function deleteData(num) {
    dataComplete = dataComplete.filter(el => el.attributes.num != num);
    if (dataComplete[0] == null) {
        location.reload();
    } else {
        tablePreview(dataComplete)
    }
}

function save_edit(num, e) {
    if (validateInput() == 0) {
        validateInput();
    } else {
        validateInput()
        for (let i = 0; i < dataComplete.length; i++) {
            if (num == dataComplete[i].attributes.num) {
                dataComplete[i] = {
                    type: "headphone",
                    name: $("#name_addheadphone").val(),
                    attributes: {
                        num: parseInt($("#_id_addheadphone").val()),
                    },
                    location: {
                        address: "461 Vũ Tông Phan",
                        floor: "Tầng 4"
                    },
                    supplier: $("#supplier_addheadphone").val(),
                    expirationDate: $("#expirationDate").val(),
                    totalPrice: parseFloat($("#total_price").val().replace(/,/g, '')),
                    billPrice: parseFloat($("#bill_price").val().replace(/,/g, '')),
                    note: $("#note_addheadphone").val()
                }
                $("#input_headphone").css("display", "none")
                $("#table_preview").css("display", "")
                $(e).parent().parent().remove()
                tablePreview(dataComplete)
            }
        }
    }
}

function validateInput() {
    var check = 1;
    if ($('#name_addheadphone').val() === '') {
        check = 0;
        $('#name_addheadphone').addClass('is-invalid')
    } else {
        $('#name_addheadphone').removeClass('is-invalid')
    }
    if ($('#bill_price').val() === '') {
        check = 0;
        $('#bill_price').addClass('is-invalid')
    } else {
        $('#bill_price').removeClass('is-invalid')
    }
    if ($('#supplier_addheadphone').val() === '') {
        check = 0;
        $('#supplier_addheadphone').addClass('is-invalid')
    } else {
        $('#supplier_addheadphone').removeClass('is-invalid')

    }
    return check;
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

function CreateDataComplete(dataheadphone, dataCreate, dataComplete) {
    const maxNumObj = changeInputNum(dataheadphone)
    for (let i = 1; i <= dataCreate.quantity; i++) {
        dataComplete.push({
            type: "headphone",
            name: dataCreate.name,
            supplier: dataCreate.supplier,
            attributes: {
                num: parseInt(maxNumObj) + i,
            },
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
$(document).ready(() => {
    $("#table_preview").css("display", "none")
    $("#_id_addheadphone").parent().parent().parent().css("display", "none")
})

function create() {
    $.ajax(GVS.setting(GVS.CreateManyDevice, 'POST', {
        devices: dataComplete,
        type: "headphone"
    })).done(res => {
        if (res.success == 1) {
            Swal.fire({
                title: "Thông báo!",
                text: res.message,
                icon: "success",
                confirmButtonText: "OK",
            }).then((result) => {
                location.reload();
            });
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

function deleteInput() {
    $('input').val("")
    $("#expirationDate").val(formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6))))
}