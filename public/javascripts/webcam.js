$(document).ready(() => {
    renderAllWebcam()
})
var dataWebcam = []
var dataComplete = []
var ObjSupplier = {}

function renderOptionSupplier() {
    $.ajax(GVS.setting(GVS.GetAllSupplier, 'GET')).done(res => {
        var html = ''
        res.metadata.forEach((el) => {
            html += `<option value = "${el._id}">${el.name}</option>`
            ObjSupplier[el._id] = el.name
        })
        $("#supplier_addwebcam").html(html)
    })
}
let arrSortWithStatus = [0, 1, -1]

function renderAllWebcam() {
    $.ajax(GVS.setting(GVS.GetAllDeciveByType, 'POST', {
        type: 'webcam'
    })).done(res => {
        if (res.success == 1) {
            let data = res.metadata
            var datas
            // let arr = datas
            datas = renderDeviceByStatus(data, datas)
            sortArrayByAnotherArray(datas, arrSortWithStatus, 'status')
            datas.forEach((el) => {
                dataWebcam.push({
                    name: el.name,
                    num: el.attributes.num,
                    status: el.status,
                    billPrice: el.billPrice,
                    totalPrice: el.totalPrice,
                    createdAt: el.createdAt,
                    expirationDate: el.expirationDate,
                    location: el.location,
                    note: el.note,
                    user: el.user,
                    supplier: el.supplier
                })
            })
            renderTableMain(dataWebcam)
            $("#table_webcam").DataTable({
                "pageLength": 50,
                lengthMenu: [20, 40, 50, 100, 200, 500],
            })
            autoCompleteInput("billPrice", "datalistbillprice", dataWebcam)
            autoCompleteInput("totalPrice", "datalisttotalprice", dataWebcam)
            autoCompleteInput("name", "datalistname", dataWebcam)
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
                                    <button type="button"  onclick = "cancel()" class="btn btn-danger" style = "background-color: #F81111;border-radius: 29px;padding-left: 45%;padding-right: 45%;">
                                        Hủy
                                    </button>
                                </div>
                            </div>`)
                    $("#input_webcam").css("display", "none")

                    var dataCreate = {
                        quantity: $("#quantity").val(),
                        num: $("#_id_addwebcam").val(),
                        name: $("#name_addwebcam").val(),
                        supplier: $("#supplier_addwebcam").val(),
                        expirationDate: $("#expirationDate").val(),
                        totalPrice: $("#total_price").val(),
                        billPrice: $("#bill_price").val(),
                        note: $("#note_addwebcam").val()
                    }
                    $("#preview").parent().parent().css("display", "none")
                }
                CreateDataComplete(dataWebcam, dataCreate, dataComplete)
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
        "-1": "Đã hỏng",
        "1": "Có thể sử dụng"
    }

    dataWebcam.forEach(webcam => {
        if (webcam.status == -1) {
            html += `<tr class= "align-middle text-center " style = "background-color:#faaaaa">`
        } else if (webcam.status == 1) {
            html += `<tr class= "align-middle text-center" style = "background-color: #fffeb6bf">`
        } else {

            html += `<tr class= "align-middle text-center">`
        }
        html += `
        <td class = "p-0">
            <a href="">
            <i class='fa fa-eye c-purple' style ="font-size: 1rem ;" ></i>
            </a>
        </td>
        <td>${webcam.num}
        <td>${webcam.name}
        <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(webcam.billPrice)}</td>
        <td>${webcam.supplier.name}</td>
        <td>${statusChange[webcam.status]}</td>
        <td>${webcam.location.address}</td>
        <td>${webcam.location.floor}</td>
        <td>${new Date(webcam.createdAt).toLocaleDateString('vi-VN')}</td>
        <td> ${new Date(webcam.expirationDate).toLocaleDateString('vi-VN')}</td>
        <td>${webcam.note}</td>
        </tr >`
    });
    $("#webcam_table").html(html)
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
    dataComplete.forEach((elm, index) => {
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
    $("#_id_addwebcam").parent().parent().parent().css("display", "")
    $("#table_preview").css("display", "none")
    $("#input_webcam").css("display", "")
    $("#input_webcam").append(`<div class="row my-3 justify-content-center">
                <div class="col-11 d-flex justify-content-end pe-0">
                    <button class="btn btn-success px-5" onclick="save_edit(${num},this)" style = "background-color: #04A544;
                    border-radius: 29px;">Lưu</button>
                </div>
            </div>`)
    var currentDevice = dataComplete.find(el => el.attributes.num == num)

    $("#_id_addwebcam").val(currentDevice.attributes.num)
    $("#name_addwebcam").val(currentDevice.name)
    $("#supplier_addwebcam").val(currentDevice.supplier)
    $("#bill_price").val(currentDevice.billPrice)
    $("#_id_monitor").val(currentDevice.attributes.num)
    $("#bill_price").val(parseInt(currentDevice.billPrice))
    $("#total_price").val(parseInt(currentDevice.totalPrice))
    $("#expirationDate").val(currentDevice.expirationDate)
    $("#quantity").parent().parent().parent().remove()
    formatCurrency($("#bill_price"))
    formatCurrency($("#total_price"))
}

function deleteData(num) {
    // dataComplete.splice(index, 1)
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
                    type: "webcam",
                    name: $("#name_addwebcam").val(),
                    location: {
                        address: "461 Vũ Tông Phan",
                        floor: "Tầng 4"
                    },
                    attributes: {
                        num: parseInt($("#_id_addwebcam").val()),
                    },
                    supplier: $("#supplier_addwebcam").val(),
                    expirationDate: $("#expirationDate").val(),
                    totalPrice: parseFloat($("#total_price").val().replace(/,/g, '')),
                    billPrice: parseFloat($("#bill_price").val().replace(/,/g, '')),
                    note: $("#note_addwebcam").val()
                }
                $("#input_webcam").css("display", "none")
                $("#table_preview").css("display", "")
                $(e).parent().parent().remove()
                tablePreview(dataComplete)
            }
        }
    }
}

function validateInput() {
    var check = 1;
    if ($('#name_addwebcam').val() === '') {
        check = 0;
        $('#name_addwebcam').addClass('is-invalid')
    } else {
        $('#name_addwebcam').removeClass('is-invalid')
    }
    if ($('#bill_price').val() === '') {
        check = 0;
        $('#bill_price').addClass('is-invalid')
    } else {
        $('#bill_price').removeClass('is-invalid')
    }
    if ($('#supplier_addwebcam').val() === '') {
        check = 0;
        $('#supplier_addwebcam').addClass('is-invalid')
    } else {
        $('#supplier_addwebcam').removeClass('is-invalid')

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

function CreateDataComplete(datawebcam, dataCreate, dataComplete) {
    const maxNumObj = changeInputNum(datawebcam)
    for (let i = 1; i <= dataCreate.quantity; i++) {
        dataComplete.push({
            type: "webcam",
            attributes: {
                num: parseInt(maxNumObj) + i
            },
            name: dataCreate.name,
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
$(document).ready(() => {
    $("#table_preview").css("display", "none")
    $("#_id_addwebcam").parent().parent().parent().css("display", "none")
})

function create() {
    $.ajax(GVS.setting(GVS.CreateManyDevice, 'POST', {
        devices: dataComplete,
        type: "webcam"
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