$(document).ready(() => {
    renderAllWacom()
})
var dataWacom = []
var dataComplete = []
var ObjSupplier = {}

function renderOptionSupplier() {
    $.ajax(GVS.setting(GVS.GetAllSupplier, 'GET')).done(res => {
        var html = ''
        res.metadata.forEach((el) => {
            html += `<option value = "${el._id}">${el.name}</option>`
            ObjSupplier[el._id] = el.name
        })
        $("#supplier_addwacom").html(html)
    })
}
let arrSortWithStatus = [0, 1, -1]

function renderAllWacom() {
    $.ajax(GVS.setting(GVS.GetAllDeciveByType, 'POST', {
        type: 'wacom'
    })).done(res => {
        if (res.success == 1) {
            let data = res.metadata
            var datas
            // let arr = datas
            datas = renderDeviceByStatus(data, datas)
            sortArrayByAnotherArray(datas, arrSortWithStatus, 'status')
            datas.forEach((el) => {
                dataWacom.push({
                    _id: el._id,
                    name: el.name,
                    num: el.attributes.num,
                    seriesNumber: el.attributes.seriesNumber,
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
            renderTableMain(dataWacom)
            $("#table_wacom").DataTable({
                "pageLength": 50,
                lengthMenu: [20, 40, 50, 100, 200, 500],
            })
            autoCompleteInput("billPrice", "datalistbillprice", dataWacom)
            autoCompleteInput("totalPrice", "datalisttotalprice", dataWacom)
            autoCompleteInput("name", "datalistname", dataWacom)
            autoCompleteInput("seriesNumber", "datalistseriesnumber", dataWacom)
            $('#preview').click(() => {
                if (validateInput() == 0) {
                    validateInput();
                } else {
                    validateInput();
                    $("#table_preview").css("display", "")
                    $("#table_preview").append(`<div class="justify-content-center text-center mb-3 row p-0" id="action">
                                <div class="col-1" style="width: max-content;">
                                    <button type="button" onclick="create()" class="btn btn-success px-4"style = "border-radius: 29px;
                                    background-color: #04A544;" >
                                        Đồng ý
                                    </button>
                                </div>
                                <div class="col-1 ps-0">
                                    <button type="button"  onclick = "cancel()" class="btn btn-danger" style = "background-color: #F81111;border-radius: 29px;padding-left: 45%;padding-right: 45%;">
                                        Hủy
                                    </button>
                                </div>
                            </div>`)
                    $("#input_wacom").css("display", "none")

                    var dataCreate = {
                        quantity: $("#quantity").val(),
                        num: $("#_id_addwacom").val(),
                        name: $("#name_addwacom").val(),
                        seriesNumber: $("#seriesnumber").val(),
                        supplier: $("#supplier_addwacom").val(),
                        expirationDate: $("#expirationDate").val(),
                        totalPrice: $("#total_price").val(),
                        billPrice: $("#bill_price").val(),
                        note: $("#note_addwacom").val()
                    }
                    $("#preview").parent().parent().css("display", "none")
                    CreateDataComplete(dataWacom, dataCreate, dataComplete)
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


function renderTableMain() {
    var html = ''
    var statusChange = {
        "0": "Đang sử dụng",
        "-1": "Đã hỏng",
        "1": "Có thể sử dụng"
    }

    dataWacom.forEach(wacom => {
        if (wacom.status == -1) {
            html += `<tr class= "align-middle text-center " style = "background-color:#faaaaa">`
        } else if (wacom.status == 1) {
            html += `<tr class= "align-middle text-center" style = "background-color: #fffeb6bf">`
        } else {

            html += `<tr class= "align-middle text-center">`
        }
        html += `
        <td class = "p-0">
            <a href="/api/device/details/${wacom._id}">
            <i class='fa fa-eye c-purple p-1 text-decoration-none'  style ="font-size: 1rem ;" ></i>
            </a>
        </td>
        <td>${wacom.num}
        <td>${wacom.name}
        <td>${wacom.seriesNumber}
        <td>${wacom.billPrice != null ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wacom.billPrice)}`: ""}</td>
        <td>${statusChange[wacom.status]}</td>
        <td>${wacom.supplier ? wacom.supplier.name : ""}</td>
        <td>${wacom.location ? wacom.location.address : ""}</td>
        <td>${wacom.location ? wacom.location.floor : ""}</td>
        <td> ${wacom.createdAt != null ? `${new Date(wacom.createdAt).toLocaleDateString('vi-VN')}` : ""}</td>
        <td>${wacom.expirationDate != null ? `${new Date(wacom.expirationDate).toLocaleDateString('vi-VN')}` : ""}</td>
        <td>${wacom.note}</td>
        </tr >`
    });
    $("#wacom_table").html(html)
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


function changeSeriesNumberDevice(seriesNumber, num) {
    $(`#seriNumberPreview_${num}`).removeAttr("onclick")
    $(`#seriNumberPreview_${num}`).html(`<input type="text" id = "inputSeriNmberPreview" class = "form-control ps-4" value = '${seriesNumber}' onblur = "changeSeriNumberDeviceInDataCreate(this,'${seriesNumber}',${num})">`)
    $("#inputSeriNmberPreview").select()
}

function changeSeriNumberDeviceInDataCreate(e, seriesNumber, num) {
    var checkSeriNumber = true
    dataComplete.forEach((el) => {
        if (el.attributes.seriesNumber == $(e).val()) {
            checkSeriNumber = false
        }
    })
    if (checkSeriNumber) {
        $(`#seriNumberPreview_${num}`).html(`${$(e).val()}`)
        $(`#seriNumberPreview_${num}`).attr("onclick", `changeSeriesNumberDevice('${$(e).val()}',${num})`)
        dataComplete.forEach((el) => {
            if (el.attributes.num == num) {
                el.attributes.seriesNumber = $(e).val()
            }
        })
    } else {
        Swal.fire({
            title: "Thông báo!",
            text: `Đã tồn tại số seri ${$(e).val()}`,
            icon: "error",
            confirmButtonText: "OK",
        }).then(() => {
            $(`#seriNumberPreview_${num}`).html(`${seriesNumber}`)
            $(`#seriNumberPreview_${num}`).attr("onclick", `changeSeriesNumberDevice('${seriesNumber}',${num})`)
        })
    }
}

function tablePreview(dataComplete) {
    var htmlCheckInput = ''
    dataComplete.forEach((elm) => {
        htmlCheckInput += `<tr>
                        <td class = "text-center col" id = "numPreview_${elm.attributes.num}" onclick = "changeNumDevice(${elm.attributes.num})">${elm.attributes.num}</td>
                        <td class = "text-center col" id = "seriNumberPreview_${elm.attributes.num}" onclick = "changeSeriesNumberDevice('${elm.attributes.seriesNumber}',${elm.attributes.num})">${elm.attributes.seriesNumber}</td>
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
    $("#_id_addwacom").parent().parent().parent().css("display", "")
    $("#table_preview").css("display", "none")
    $("#input_wacom").css("display", "")
    $("#input_wacom").append(`<div class="row my-3 justify-content-center">
                <div class="col-11 d-flex justify-content-end pe-0">
                    <button class="btn btn-success px-5" onclick="save_edit(${num},this)" style = "background-color: #04A544;
                    border-radius: 29px;">Lưu</button>
                </div>
                </div>`)
    $("#quantity").parent().parent().parent().remove()
    var currentDevice = dataComplete.find(el => el.attributes.num == num)
    $("#_id_addwacom").val(currentDevice.attributes.num)
    $("#name_addwacom").val(currentDevice.name)
    $("#seriesnumber").val(currentDevice.attributes.seriesNumber)
    $("#supplier_addwacom").val(currentDevice.supplier)
    $("#bill_price").val(parseInt(currentDevice.billPrice))
    $("#total_price").val(parseInt(currentDevice.totalPrice))
    $("#expirationDate").val(currentDevice.expirationDate)
    $("#note_addcase").val(currentDevice.note)
    formatCurrency($("#bill_price"))
    formatCurrency($("#total_price"))

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
                    type: "wacom",
                    name: $("#name_addwacom").val(),
                    attributes: {
                        num: parseInt($("#_id_addwacom").val()),
                        seriesNumber: $("#seriesnumber").val()
                    },
                    location: {
                        address: "461 Vũ Tông Phan",
                        floor: "Tầng 4"
                    },
                    supplier: $("#supplier_addwacom").val(),
                    expirationDate: $("#expirationDate").val(),
                    totalPrice: parseFloat($("#total_price").val().replace(/,/g, '')),
                    billPrice: parseFloat($("#bill_price").val().replace(/,/g, '')),
                    note: $("#note_addwacom").val()
                }
                $("#input_wacom").css("display", "none")
                $("#table_preview").css("display", "")
                $(e).parent().parent().remove()
                tablePreview(dataComplete)
            }
        }
    }
}

function validateInput() {
    var check = 1;
    if ($('#name_addwacom').val() === '') {
        check = 0;
        $('#name_addwacom').addClass('is-invalid')
    } else {
        $('#name_addwacom').removeClass('is-invalid')
    }
    if ($('#bill_price').val() === '') {
        check = 0;
        $('#bill_price').addClass('is-invalid')
    } else {
        $('#bill_price').removeClass('is-invalid')
    }
    if ($('#supplier_addwacom').val() === '') {
        check = 0;
        $('#supplier_addwacom').addClass('is-invalid')
    } else {
        $('#supplier_addwacom').removeClass('is-invalid')

    }
    if ($('#seriesnumber').val() === '') {
        check = 0;
        $('#seriesnumber').addClass('is-invalid')
    } else {
        $('#seriesnumber').removeClass('is-invalid')

    }
    return check;
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

function CreateDataComplete(datawacom, dataCreate, dataComplete) {
    const maxNumObj = changeInputNum(datawacom)
    for (let i = 1; i <= dataCreate.quantity; i++) {
        dataComplete.push({
            type: "wacom",
            attributes: {
                num: parseInt(maxNumObj) + i,
                seriesNumber: dataCreate.seriesNumber
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
    $("#_id_addwacom").parent().parent().parent().css("display", "none")
})

function create() {
    var arraySeriNumber = []
    dataComplete.forEach(element => {
        arraySeriNumber.push(element.attributes.seriesNumber)
    });
    var hasDuplicates = arraySeriNumber.length !== new Set(arraySeriNumber).size;
    if (hasDuplicates) {
        Swal.fire({
            title: "Thông báo!",
            text: "Seri Number không được giống nhau",
            icon: "error",
            confirmButtonText: "OK",
        });
    } else {
        $.ajax(GVS.setting(GVS.CreateManyDevice, 'POST', {
            devices: dataComplete,
            type: "wacom"
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
}

function deleteInput() {
    $('input').val("")
    $("#expirationDate").val(formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6))))

}