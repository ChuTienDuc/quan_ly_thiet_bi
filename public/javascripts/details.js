const id = window.location.pathname.split('/').pop();
var device;
async function getDataDevice() {
    var result = await $.ajax(GVS.setting("/api/device/details", "POST", {
        _id: id
    }))
    if (result.success == 1) {
        device = result.metadata
        renderDataDeviceType(device)
        renderComponentDevice(device)
        if (result.metadata.type == "case") {
            renderHistoryDevice(device)
        }
        renderHistoryStaffDevice(device)
    } else {
        Swal.fire({
            title: "Thông báo!",
            text: "Không tồn tại thiết bị!",
            icon: "error",
            confirmButtonText: "OK",
        }).then(() => {
            window.location.href = "/"
        })
    }

}

function renderDataDeviceType(device) {
    var typeDeviceObj = {
        case: "Máy số ",
        monitor: "Màn hình số ",
        wacom: "Wacom số ",
        webcam: "Webcam số ",
        headphone: "Tai nghe số ",
        ups: "UPS số "
    }
    if (device.type == "case") {
        // $("#numDeviceShow").text(`Máy số ${device.attributes.num}`)
        $("#numDeviceShow").html(`<div class="col-3">
        <i class="fa fa-arrow-left p-2" onclick = "history.back()"
            style="border-radius: 5px; border: 1px solid #d6d6d6; font-size: 1.5rem; cursor: pointer"></i>
        <span class="ms-3 name_device f-s-18">${typeDeviceObj[device.type]}${device ? device.attributes.num : ''}</span>
    </div>`)
    }
    var html = '';
    const status = device.status
    const objstatus = {
        "1": "Chưa sử dụng",
        "-1": "Đã hỏng",
        "0": "Đang sử dụng"
    }
    html += `
        <div class="header_tabs">
            <div class="row justify-content-between">
                <div class="col-3 d-flex align-item-center">
                    <i class="fa fa-arrow-left p-2" onclick = "history.back()"
                        style="border-radius: 5px; border: 1px solid #d6d6d6; font-size: 1.5rem; cursor: pointer"></i>
                    <span class="ms-3 name_device f-s-18" style="color: #00246E;
                    text-shadow: 2px 1px 0px #9AFFFF;
                    font-size: 31px;
                    font-family: Lexend;
                    font-weight: 700;">${typeDeviceObj[device.type]}${device ? device.attributes.num : ''}</span>
                </div>
                <div class="col-6 text-end">
                <button type="button" class="btn btn-success py-2  d-none" id="detail__button-hanover" onclick="renderStaff()" data-bs-toggle="modal"
                data-bs-target="#modal-handover">Bàn giao thiết bị
                <i class="fa fa-plus"></i>
            </button>
                </div>
            </div>
        </div>
        <hr>
        <div class="row justify-content-center f-s-16">
            <div class="col-10">
                <div class="row justify-content-between mt-3">
                    <div class="col-6">
                        <div class="row justify-content-between">
                            <div class="col-3">
                                <span class ="color_title_add_device" >Loại thiết bị</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control py-0 input_detail " style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.type}" disable>
                                </div>
                            </div>
                            <div class="col-3">
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="row justify-content-between">
                            <div class="col-3">
                                <span class ="color_title_add_device">Ngày nhập kho</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control py-0 input_detail" onblur = "onblurUpdate(this,'createdAt')" onkeypress="keypressUpdate(this, 'createdAt',event)" style="font-size: 16px"
                                        aria-label="Sizing example input" pattern="\d{2}-\d{2}-\d{4}"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${new Date(device.createdAt).toLocaleDateString("vi-VN")}" disabled>
                                </div>
                            </div>
                            <div class="col-3">
                                
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row justify-content-between mt-2">
                    <div class="col-6">
                        <div class="row justify-content-between">
                            <div class="col-3">
                                <span class ="color_title_add_device">Số thiết bị</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail py-0" onblur = "onblurUpdate(this,'num')" onkeypress="keypressUpdate(this, 'num',event)" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default" 
                                        value="${device.attributes ? device.attributes.num || "Không" : "Không"}" disabled>
                                </div>
                                <a class="edit_device" onclick = "changeStatusInput(this)" title="Edit" data-toggle="tooltip" style = "position: absolute;right: 4%;top:0 ;z-index:999">
                                    <i class="fa fa-edit "style="font-size: 1.25rem;"></i>
                                </a>
                            </div>
                            <div class="col-3">
                                
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="row justify-content-betweenmt-2">
                            <div class="col-3">
                                <span class ="color_title_add_device">Hạn bảo hành</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3">
                                    <input type="date" class="form-control input_detail py-0" onblur = "onblurUpdate(this,'expirationDate')" onkeypress="keypressUpdate(this, 'expirationDate',event)" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.expirationDate == null ? " " : new Date(device.expirationDate).toISOString().split('T')[0]}" disabled>
                                </div>
                                <a class="edit_device" onclick = "changeStatusInput(this)" title="Edit" data-toggle="tooltip" style = "position: absolute;right: 4%;top:0 ;z-index:999"><i
                                        class="fa fa-edit "
                                        style="font-size: 1.25rem;"></i></a>
                            </div>
                            <div class="col-3">
                                
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row justify-content-between mt-2">
                    <div class="col-6">
                        <div class="row justify-content-between">
                            <div class="col-3">
                                <span class ="color_title_add_device">Tên thiết bị</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail py-0" onblur = "onblurUpdate(this,'name')" onkeypress="keypressUpdate(this, 'name',event)" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.name == undefined ? "Không có tên" : device.name}" disabled>
                                </div>
                                <a class="edit_device ${device.name == undefined ? 'd-none' : ''}" onclick = "changeStatusInput(this)" title="Edit" data-toggle="tooltip" style ="position: absolute;right: 4%;top:0 ;z-index:999"><i
                                        class="fa fa-edit "
                                        style="font-size: 1.25rem;"></i></a>
                            </div>
                            
                            <div class="col-3" >
                                
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="row justify-content-betweenmt-2">
                            <div class="col-3">
                                <span class ="color_title_add_device">Nhà cung cấp</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail py-0" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${(device.supplier && device.supplier.name) ? device.supplier.name : ""}" disabled>
                                </div>
                                <a class="edit_device" onclick = "changeStatusInput(this,'supplier')" title="Edit" data-toggle="tooltip" style ="position: absolute;right: 4%;top:0 ;z-index:999"><i
                                        class="fa fa-edit "
                                        style="font-size: 1.25rem;"></i></a>
                            </div>
                            <div class="col-3">
                                
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row justify-content-between mt-2">
                    <div class="col-6">
                        <div class="row justify-content-between">
                            <div class="col-3">
                                <span class ="color_title_add_device">Giá hóa đơn</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail py-0" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.billPrice == null ? "" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(device.billPrice)}" disabled>
                                </div>
                            </div>
                            <div class="col-3">
                            </div>
                        </div>
                    </div>
                    <div class="col-6" >
                        <div class="row justify-content-betweenmt-2">
                            <div class="col-3">
                                <span class ="color_title_add_device">Địa chỉ</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail py-0" onblur = "onblurUpdate(this,'address')" onkeypress="keypressUpdate(this, 'address',event)" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.hasOwnProperty('staff') == true ? (device.staff.location ? device.staff.location.address : "") : (device.location ? device.location.address : "")}" disabled>
                                </div>
                                <a class="edit_device" onclick = "changeStatusInput(this,'address')" title="Edit" data-toggle="tooltip" style ="position: absolute;right: 4%;top:0 ;z-index:999"><i
                                        class="fa fa-edit "
                                        style="font-size: 1.25rem;"></i></a>
                            </div>
                            <div class="col-3">
                                
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row justify-content-between mt-2">
                    <div class="col-6">
                        <div class="row justify-content-between">
                            <div class="col-3">
                                <span class ="color_title_add_device">Tổng giá tiền</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail py-0" onblur = "onblurUpdate(this,'totalPrice')" id = "bill_price_update" onkeypress="keypressUpdate(this, 'totalPrice',event)" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.totalPrice == null ? "" : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(device.totalPrice)}" disabled>
                                </div>
                                <a class="edit_device" onclick = "changeStatusInput(this,'totalPrice')" title="Edit" data-toggle="tooltip" style ="position: absolute;right: 4%;top:0 ;z-index:999"><i
                                        class="fa fa-edit "
                                        style="font-size: 1.25rem;"></i></a>
                            </div>
                            <div class="col-3">
                                
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="row justify-content-betweenmt-2">
                            <div class="col-3">
                                <span class ="color_title_add_device">Tầng</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail py-0" onblur = "o py-0nblurUpdate(this,'floor')" onkeypress="keypressUpdate(this, 'floor',event)" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.hasOwnProperty('staff') == true ? (device.staff.location ? device.staff.location.floor : "") : (device.location ? device.location.floor : "")}" disabled>
                                </div>
                                <a class="edit_device" onclick = "changeStatusInput(this,'floor')" title="Edit" data-toggle="tooltip" style ="position: absolute;right: 4%;top:0 ;z-index:999"><i
                                        class="fa fa-edit "
                                        style="font-size: 1.25rem;"></i></a>
                            </div>
                            <div class="col-3">
                                
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row justify-content-between mt-2">
                    <div class="col-6">
                        <div class="row justify-content-between">
                            <div class="col-3">
                                <span class ="color_title_add_device" style = "white-space: nowrap">Người sử dụng</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail pt-1" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.staff ? device.staff.name || "Không" : "Không"}" disabled>
                                </div>
                            </div>
                            <div class="col-3">
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="row justify-content-betweenmt-2">
                            <div class="col-3">
                                <span class ="color_title_add_device">Người tạo thiết bị</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control input_detail py-0" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${device.user ? device.user.name || "Không" : "Không"}" disabled>
                                </div>
                            </div>
                            <div class="col-3">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row justify-content-between mt-2">
                    <div class="col-6">
                        <div class="row justify-content-between">
                            <div class="col-3">
                                <span class ="color_title_add_device" >Trạng thái</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3 py-0"> 
                                    <input type="text" class="form-control input_detail py-0" style="font-size: 16px"
                                        aria-label="Sizing example input"
                                        aria-describedby="inputGroup-sizing-default"
                                        value="${objstatus[status]}" disabled>
                                </div>
                                <a class="edit_device" onclick = "changeStatusInput(this,'status')" title="Edit" data-toggle="tooltip" style ="position: absolute;right: 4%;top:0 ;z-index:999"><i
                                        class="fa fa-edit "
                                        style="font-size: 1.25rem;"></i></a>
                            </div>
                            <div class="col-3">
                                
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="row justify-content-betweenmt-2">
                            <div class="col-3">
                                <span class ="color_title_add_device">Ghi chú</span>
                            </div>
                            <div class="col-6 color_title1 f-f-SanF-Medium" style = "position: relative">
                                <div class="input-group mb-3" style = "position: relative">
                                    <textarea class="form-control input_detail py-0" autocomplete="off" onblur = "onblurUpdate(this,'note')" onkeypress="keypressUpdate(this, 'note',event)" style = "min-height: 15px" style="font-size: 16px"
                                        id="" disabled
                                        aria-label="With textarea">${device.note}</textarea>
                                </div>
                                <a class="edit_device" onclick = "changeStatusInput(this)" title="Edit" data-toggle="tooltip" style ="position: absolute;right: 4%;top:0 ;z-index:999"><i
                                        class="fa fa-edit "
                                        style="font-size: 1.25rem;"></i></a>
                            </div>
                            <div class="col-3">
                            
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row justify-content-between ">
                    <div class="col-6">
                        <div class="row">
                            <div class="col-3">
                                <span class ="color_title_add_device">Cấu hình</span>
                            </div>
                            <div class="col-6 p-2 color_title1 f-f-SanF-Medium" style="border: 1px solid #ced4da;">`
    if (device.type == "case") {
        $("#pills-component-tab").removeClass("d-none")
        html += `<p class="mt-3 ">- Chipset: ${device.attributes.chipset}</p>
                                <p>- Ram: `
        const ramCounts = device.attributes.ram.reduce((counts, el) => {
            counts[el] = (counts[el] || 0) + 1;
            return counts;
        }, {});
        var indexRam = 0
        for (const el in ramCounts) {
            indexRam++
            const count = ramCounts[el];
            if (count > 1) {
                html += `${count}x${el}${indexRam == Object.keys(ramCounts).length ? "" : ", "}`;
            } else {
                html += `${el}${indexRam == Object.keys(ramCounts).length ? "" : ", "}`;
            }
        }
        html += `</p>
                <p>- VGA: `
        device.attributes.VGA.forEach((el, indexVGA) => {
            html += `${el.name} ${el.vram} `
            el.connector.forEach((elm, indexConnector) => {
                html += `${elm} ${indexConnector == (el.connector.length - 1) ? " " : ", "} `
            })
            html += `${indexVGA == (device.attributes.VGA.length - 1) ? " " : ", "}`
        })
        html += `
                </p>
                <p>- Ổ cứng: `
        device.attributes.hardDrives.forEach((el, i) => {
            html += `${el.size} ${el.type} ${el.brand}${i == device.attributes.hardDrives.length - 1 ? "" : ", "}`
        })
        html += `</p>
                <p>- PSU: ${device.attributes.PSU}</p>
                <p>- MacAddress: ${device.attributes.macAddress}</p>
                <p>- Main Board: ${device.attributes.mainBoard}</p>
                </div>`
    } else if (device.type == "monitor") {
        html += `<p>- Connetor: `
        device.attributes.connector.forEach(el => {
            html += `${el}, `
        })
    } else if (device.type == "wacom") {
        html += `<p>- Series Number: ${device.attributes.seriesNumber}`
    }

    html += `
                            <div class="col-1"></div>
                        </div>
                    </div>
                    <div class="col-6"></div>
                </div>
            </div>
        </div>`
    $("#details_device").html(html)
}

function getObjectKey(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value);
}

function changeStatusInput(e, field) {
    var inputEditDevice = $(e).parent().parent().find('input')
    var selectEditDevice = $(e).parent().parent().find('select')
    var textareaEditDevice = $(e).parent().parent().find('textarea')

    if (field == "totalPrice") {
        $(inputEditDevice).val(parseInt($(inputEditDevice).val().replace(/[^\d]/g, '')));
    }
    $(inputEditDevice).removeAttr("disabled")
    $(selectEditDevice).removeAttr("disabled")
    $(textareaEditDevice).removeAttr("disabled")



    if (field == "supplier") {
        var html = '';
        $.ajax({
            ...GVS.setting(GVS.GetAllSupplier, "GET"),
            success: (res) => {
                html += `<select class="form-select" id="" onchange = "editDevice(this,'supplier')" onblur = "editDevice(this,'supplier')">`
                res.metadata.forEach((el) => {
                    if (!device.hasOwnProperty('supplier')) {
                        html += `<option value = "${el._id}">${el.name}</option>`
                    } else {
                        if (el._id == device.supplier._id) {
                            html += `<option selected="selected" value = "${el._id}">${el.name}</option>`
                        } else {
                            html += `<option value = "${el._id}">${el.name}</option>`
                        }
                    }
                })
                html += `</select>`
                $($(inputEditDevice).parent().parent()).html(html)
            }
        })
    }
    if (field == "status") {
        var objStatusChange = {
            "1": "Chưa sử dụng",
            "0": "Đang sử dụng",
            "-1": "Đã hỏng",
        }
        var html = '';
        if (getObjectKey(objStatusChange, $(inputEditDevice).val()) == 0) {
            objStatusChange = {
                "0": "Đang sử dụng",
                "-1": "Đã hỏng",
            }
        } else {
            objStatusChange = {
                "1": "Chưa sử dụng",
                "-1": "Đã hỏng",
            }
        }
        html += `<select class="form-select select_status" id="select_status" onchange = "editDevice(this,'status')">`
        for (const key in objStatusChange) {
            if (Object.hasOwnProperty.call(objStatusChange, key)) {
                const element = objStatusChange[key];
                html += `<option value="${key}">${element}</option > `
            }
        }
        html += `</select>`
        $($(inputEditDevice).parent().parent()).html(html)
        $("#select_status").val(device.status)
    }
    if (field == "address") {
        var html = '';
        html += `<select class="form-select select_status" id="select_address" onchange = "editDevice(this,'address')">`
        GVS.ADDRESS.forEach((address) => {
            html += `<option value="${address}">${address}</option>`
        })
        html += `</select>`
        $($(inputEditDevice).parent().parent()).html(html)
        $("#select_address").val(device.location.address)
    }
    if (field == "floor") {
        var html = '';
        html += `<select class="form-select select_status" id="select_floor" onchange = "editDevice(this,'floor')">`
        for (let i = 1; i <= GVS.FLOOR; i++) {
            html += `<option value="Tầng ${i}">Tầng ${i}</option>`
        }
        html += `</select>`
        $($(inputEditDevice).parent().parent()).html(html)
        $("#select_floor").val(device.location.floor)
    }
    $(inputEditDevice).focus()
    $(textareaEditDevice).focus()
}

function onblurUpdate(e, field) {
    editDevice(e, field)
}

function keypressUpdate(e, field, event) {
    if (event.keyCode === 13 && !event.shiftKey) {
        editDevice(e, field);
    }
}

function editDevice(e, field) {
    var inputEditDevice = $(e)
    var selectEditDevice = $(e)
    var _id = device._id
    var type = device.type
    var data = {
        type: type
    }
    if (field == "num") {
        data["attributes"] = {
            num: $(inputEditDevice).val()
        }
    } else if (field == "address") {
        data["location"] = {
            address: $(inputEditDevice).val()
        }
    } else if (field == "floor") {
        data["location"] = {
            floor: $(inputEditDevice).val()
        }
    } else if (field == "status") {
        data["status"] = $(selectEditDevice).val()
    } else {
        data[field] = $(inputEditDevice).val()
    }
    $.ajax({
        ...GVS.setting(GVS.UpdateDevice + _id, "PATCH", data),
        success: (res) => {
            if (res.success == 1) {
                Swal.fire({
                    title: "Thông báo!",
                    text: res.message,
                    icon: "success",
                    confirmButtonText: "OK",
                }).then((result) => {
                    getDataDevice()
                });
            } else {
                Swal.fire({
                    title: "Thông báo!",
                    text: res.message,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        }
    })
}
$('textarea').keyup(function (event) {
    if (event.keyCode == 13 && event.shiftKey) {
        var content = this.value;
        var caret = getCaret(this);
        this.value = content.substring(0, caret) + "\n" + content.substring(carent, content.length - 1);
        event.stopPropagation();

    }
});

function renderComponentDevice(device) {
    const Keyischange = {
        PSU: "Nguồn",
        VGA: "VGA",
        chipset: "Chip Set",
        hardDrives: "Ổ cứng",
        mainBoard: "Bo mạch chủ",
        ram: "Ram",
    }
    var html = ''
    if (device.type == "case") {
        for (const key in device.attributes) {
            if (Object.hasOwnProperty.call(device.attributes, key) && key != "num" && key != "macAddress" && key != "ipAddress" && key != "_id" && key != "createdAt" && key != "expirationDate" && key != "updatedAt") {
                if (typeof (device.attributes[key]) == "object" && typeof (device.attributes[key][0]) == "object") {
                    html +=
                        renderHtmlArray2(JSON.stringify(device.attributes[key]), Keyischange[key], key)
                } else if (typeof (device.attributes[key]) == "object" && typeof (device.attributes[key][0]) == "string") {
                    html += renderHtmlArray(JSON.stringify(device.attributes[key]), Keyischange[key], key)
                } else {
                    html += renderHtml(device.attributes[key], Keyischange[key], key)
                }
            }
        }
    }
    $("#coponent_device").html(html)
}

function typeDeviceTheme(Keyischange, key) {
    let html = `
    <div class="row justify-content-center">
                            <div class="col-11 d-flex">
                                <span class="f-s-18">- ${Keyischange}</span>
                                <button class="btn btn_add ms-3 d-flex" onclick="getDeviceByType('${key}')" data-bs-toggle="modal"
                                data-bs-target="#modal-components">
                                    <i class="fa fa-add"></i>
                                </button>
                            </div>
                        </div>`
    return html
}

function renderHtml(attributes, name, key) {
    // if (!attributes) {
    //     return ''
    // }
    var html = '';

    if (attributes.length == 0) {
        html = `<div class="col-6">
        ${typeDeviceTheme(name, key)}
    <div class="row justify-content-center">
        <div class="col-11">
            <table class="table table-bordered mt-2 text-center">
                <thead style="background-color: #d2f5ff;">
                    <tr>
                        <th class="col-3">Tên thiết bị</th>
                        <th class="col-3">Cấu hình</th>
                        <th class="col-2">Kiểu thiết bị</th>
                        <th class="col-1">Thu hồi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan = "4">Không có dữ liệu</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>
    </div>`
        return html
    }
    html += `
    <div class="col-6">
    ${typeDeviceTheme(name, key)}
<div class="row justify-content-center">
    <div class="col-11">
        <table class="table table-bordered mt-2 text-center">
            <thead style="background-color: #d2f5ff;">
                <tr>
                    <th class="col-3">Tên thiết bị</th>
                    <th class="col-3">Cấu hình</th>
                    <th class="col-2">Kiểu thiết bị</th>
                    <th class="col-1">Thu hồi</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${name}</td>
                    <td>${attributes}</td>
                    <td>Thiết bị trong</td>
                    <td>
                       <a class="text-danger" onclick="revokeComponent('${key}',0)"><i class="fa f-s-22 fa-trash"></i></a>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>
</div>`
    return html;
}

function renderHtmlArray(attributes, name, key) {
    attributes = JSON.parse(attributes)
    var html = '';
    html += `
    <div class="col-6">
    ${typeDeviceTheme(name, key)}
<div class="row justify-content-center">
    <div class="col-11">
        <table class="table table-bordered mt-2 text-center">
            <thead style="background-color: #d2f5ff;">
                <tr>
                    <th class="col-3">Tên thiết bị</th>
                    <th class="col-3">Cấu hình</th>
                    <th class="col-2">Kiểu thiết bị</th>
                    <th class="col-1">Thu hồi</th>
                </tr>
            </thead>
            <tbody>
                <tr>`
    html += `<td rowspan = ${attributes.length + 1}>${name}</td> `
    attributes.forEach((element, i) => {
        html += `<tr>
                    <td>
                        <div>${element}</div>
                    </td>
                    <td>Thiết bị trong</td>
                    <td>
                        <a class="text-danger" onclick="revokeComponent('${key}',${i})"><i class="fa f-s-22 fa-trash"></i></a>
                    </td>
                    </tr>`
    });
    html += `</tr>
            </tbody>
        </table>
    </div>
    </div>
</div>`
    return html;
}

function renderHtmlArray2(attributes, name, key) {
    attributes = JSON.parse(attributes)
    var html = '';
    html += `
    <div class="col-6">
    ${typeDeviceTheme(name, key)}
<div class="row justify-content-center">
    <div class="col-11">
        <table class="table table-bordered mt-2 text-center">
            <thead style="background-color: #d2f5ff;">
                <tr>
                    <th class="col-3">Tên thiết bị</th>
                    <th class="col-3">Cấu hình</th>
                    <th class="col-2">Kiểu thiết bị</th>
                    <th class="col-1">Thu hồi</th>
                </tr>
            </thead>
            <tbody>
                <tr>`
    html += `<td rowspan = ${attributes.length + 1}>${name}</td> `

    attributes.forEach((element, i) => {
        const {
            count,
            ...newObj
        } = element
        var textResult = ''
        for (const el in newObj) {
            textResult += newObj[el] + " "
        }
        html += `<tr>
                        <td>
                            <div>${textResult}</div>
                        </td>
                        <td>Thiết bị trong</td>
                        <td>
                            <a class="text-danger" onclick="revokeComponent('${key}',${i})"><i class="fa f-s-22  fa-trash"></i></a>
                        </td>
                    </tr>`;

    });
    html += `</tr>
            </tbody>
        </table>
    </div>
    </div>
</div>`
    return html;
}

function checkDifferentValues(obj1, obj2, keysToCompare) {
    var differentValues = [];

    for (var key of keysToCompare) {
        if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
            var device = obj1[key];
            var old_device = obj2[key];

            if (typeof device === 'object' && typeof old_device === 'object') {
                if (Array.isArray(device) && Array.isArray(old_device)) {
                    if (!arraysAreEqual(device, old_device)) {
                        differentValues.push({
                            key: key,
                            device: device,
                            old_device: old_device
                        });
                    }
                } else {
                    var subDiff = checkDifferentValues(device, old_device, keysToCompare);
                    differentValues = differentValues.concat(subDiff);
                }
            } else {
                if (device !== old_device) {
                    differentValues.push({
                        key: key,
                        device: device,
                        old_device: old_device
                    });
                }
            }
        }
    }

    return differentValues;
}

function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (var i = 0; i < arr1.length; i++) {
        var device = arr1[i];
        var old_device = arr2[i];

        if (typeof device === 'object' && typeof old_device === 'object') {
            if (Array.isArray(device) && Array.isArray(old_device)) {
                if (!arraysAreEqual(device, old_device)) {
                    return false;
                }
            } else if (typeof device === 'object' && typeof old_device === 'object') {
                var subDiff = checkDifferentValues(device, old_device, Object.keys(device));
                if (subDiff.length > 0) {
                    return false;
                }
            }
        } else if (device !== old_device) {
            return false;
        }
    }

    return true;
}

function renderHistoryStaffDevice(device) {
    var html = '';
    var arrHistoryChangeDevice = []
    $.ajax({
        ...GVS.setting(GVS.GetHistoryByIdDevice + device._id, "POST", {}),
        success: (res) => {
            res.metadata.forEach((el) => {
                if (!el.hasOwnProperty("old_device")) {
                    arrHistoryChangeDevice.push(el)
                }
                if (!el.staff) {
                    return;
                }
            })
            const result = arrHistoryChangeDevice.reduce((acc, cur) => {
                const staffId = cur.staff._id;
                const type = cur.type;
                if (!acc[staffId]) {
                    acc[staffId] = {};
                }
                if (!acc[staffId][type]) {
                    acc[staffId][type] = [];
                }
                acc[staffId][type].push(cur);
                return acc;
            }, {});
            var i = 0;
            for (const key in result) {
                if (Object.hasOwnProperty.call(result, key)) {
                    const element = result[key];
                    const maxLengths = Object.values(result).map(obj => {
                        return Math.max(...Object.values(obj).map(arr => arr.length));
                    });
                    if (element[1]) {
                        html += `<tr>
                        <td rowspan = ${maxLengths[i]}>${element[1][0].staff.name}</td>`
                        element[1].forEach((elm, index) => {
                            html += `
                        <td>${new Date(elm.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td>${elm.user.name}</td>`
                            if (element[0]) {
                                if (element[0][index]) {
                                    html += `
                                            <td>${new Date(element[0][index].createdAt).toLocaleDateString("vi-VN")}</td>
                                            <td>${element[0][index].user.name}</td>`
                                } else {
                                    html += `<td></td>`
                                    html += `<td></td>`
                                }
                            } else {
                                html += `<td></td>`
                                html += `<td></td>`
                            }
                            html += ` </tr>`
                        });
                        i++
                    }
                }
            }
            $("#historiyDevice").html(html)
            // TODO Lịch sử thay đổi của thiết bị
            // var keysToCompare = ['PSU', 'VGA', 'chipset', 'hardDrives', 'mainBoard', 'ram'];
            // var html = ''
            // arrHistoryChangeDevice.forEach(elm => {
            //     var changeComponentDevice = checkDifferentValues(elm.device.attributes, elm.old_device.attributes, keysToCompare)
            //     html += `<tr>`
            //     html += `<td>${elm.staff.name}</td>`
            //     html += `<td>${changeComponentDevice[0].key}</td><td>`
            //     if (Array.isArray(changeComponentDevice[0].device) && Array.isArray(changeComponentDevice[0].old_device)) {
            //         html += renderChangeComponent(changeComponentDevice[0].old_device)
            //         html += `</td><td>`
            //         html += renderChangeComponent(changeComponentDevice[0].device)
            //     }
            //     else {
            //         html += `${changeComponentDevice[0].device}</td><td>${changeComponentDevice[0].device}`
            //     }
            //     html += `</td> <td>${new Date(elm.createdAt).toLocaleDateString('vi-VN')}</td>`
            //     html += `</tr>`
            // })
            // $("#changeComponentDevice").html(html)
        }
    })

}

function setHeightDivTimeline() {
    for (let index = 0; index < $(".li_timelineHistory").length; index++) {
        const element = $(".li_timelineHistory")[index];
        $(element).find('.div_timeline').height(250)
    }
}

function renderComponentMany(component) {
    var html = "";
    html += `<ul>`
    component.forEach((element) => {
        if (typeof (element) == "object") {
            html += `<li>`
            for (const key in element) {
                if (Object.hasOwnProperty.call(element, key)) {
                    const el = element[key];
                    if (Array.isArray(el)) {
                        el.forEach((e) => {
                            html += `${e} `
                        })
                    } else {
                        html += `${el} `
                    }
                }
            }
            html += `</li>`
        } else {
            html += `<li>${element}</li>`
        }

    })
    html += `</ul>`

    return html
}

function renderHistoryDevice(device) {
    var arrHistoryChangeDevice = []
    $.ajax({
        ...GVS.setting(GVS.GetHistoryByIdDevice + device._id, "POST", {}),
        success: (res) => {
            var html = '';
            res.metadata.forEach((el, index) => {
                if (el.old_device || index == 0) {
                    arrHistoryChangeDevice.push(el)
                }
                if (!el.staff) {
                    return;
                }
            })
            html += `<ol class = "ol_timeline">`
            arrHistoryChangeDevice.forEach((historyDevice, i) => {
                html += ` <li class = "li_timelineHistory li_${i % 2 == 0 ? "even" : "odd"}" data-bs-toggle="tooltip" data-bs-placement="top" title="${new Date(historyDevice.createdAt).toLocaleDateString('vi-VN')}">
                    <div class = "div_timeline d-none">
                    <i class='fa fa-minus c-white p-2 icon_hidden_div_timline' style ="font-size: 1.25rem ; top: 0px; position: absolute; font-size: 2rem; right: 5px; cursor : pointer"></i>
                        <time style = "color: white">${new Date(historyDevice.createdAt).toLocaleDateString('vi-VN')} - ${new Date(historyDevice.createdAt).toLocaleTimeString('vi-VN')}</time>
                        <p class = "m-0">Chip set: ${historyDevice.device.attributes.chipset}</p>
                        <p class = "m-0">Ram: ${historyDevice.device.attributes.ram.length == 0 ? "Chưa có ram" : `${historyDevice.device.attributes.ram.length == 1 ? `${historyDevice.device.attributes.ram[0]}` : `${renderComponentMany(historyDevice.device.attributes.ram)}`} `}</p>
                        <p class = "m-0">Ổ cứng: ${historyDevice.device.attributes.hardDrives.length == 0 ? "Chưa có ổ cứng" : `${historyDevice.device.attributes.hardDrives.length == 1 ? `${historyDevice.device.attributes.hardDrives[0].size + " " + historyDevice.device.attributes.hardDrives[0].type + " " + historyDevice.device.attributes.hardDrives[0].brand}` : `${renderComponentMany(historyDevice.device.attributes.hardDrives)}`}`}`
                html += `</p><p class = "m-0">VGA: ${historyDevice.device.attributes.VGA.length == 0 ? "Chưa có VGA" : `${historyDevice.device.attributes.VGA.length == 1 ? `${historyDevice.device.attributes.VGA[0].name + " " + historyDevice.device.attributes.VGA[0].vram + " " + historyDevice.device.attributes.VGA[0].connector}` : `${renderComponentMany(historyDevice.device.attributes.VGA)}`}`}`
                html += `</p>
                        <p class = "m-0">Bo mạch chủ: ${historyDevice.device.attributes.mainBoard}</p>
                        <p class = "m-0">Nguồn: ${historyDevice.device.attributes.PSU}</p>
                    </div>
                    <img class = "d-none img_arrow img_arrow_${i % 2 == 0 ? "even" : "odd"}" src="/images/${i % 2 == 0 ? "arrowDown.svg" : "arrowUp.svg"}"/>
            </li>`
            })
            html += `</ol>`
            if (arrHistoryChangeDevice.length == 0) {
                html = `<div class="col-10 f-s-24 text-center">Chưa thay đổi cấu hình lần nào</div>`
            }
            $("#timelineHistory").html(html)
            $("#timelineHistory ol").css("padding", "20px")
            setHeightDivTimeline()
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('.li_timelineHistory'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
            var countLiEven = 0
            var countLiOdd = 0
            $(".li_even").click((e) => {
                countLiEven++;
                const parentElement = $(e.currentTarget).closest('.li_even');
                parentElement.find('.div_timeline').removeClass('d-none');
                parentElement.find('.img_arrow_even').removeClass('d-none');
                parentElement.find('.div_timeline').addClass('active_even_timeline');
                if (countLiEven > 0) {
                    $("#timelineHistory ol").css("padding-top", "320px");
                    const timelineBottom = $("#timelineHistory").offset().top + $("#timelineHistory").height();
                    $('html, body').animate({
                        scrollTop: timelineBottom + 500
                    }, 500);
                }
            });
            $(".li_odd").click((e) => {
                countLiOdd++;
                const parentElement = $(e.currentTarget).closest('.li_odd');
                parentElement.find('.div_timeline').removeClass('d-none');
                parentElement.find('.img_arrow_odd').removeClass('d-none');
                parentElement.find('.div_timeline').addClass('active_odd_timeline');
                if (countLiOdd > 0) {
                    $("#timelineHistory ol").css("padding-bottom", "320px");
                    const timelineBottom = $("#timelineHistory").offset().top + $("#timelineHistory").height();
                    $('html, body').animate({
                        scrollTop: timelineBottom
                    }, 500);
                }
            });
            $(".icon_hidden_div_timline").click((e) => {
                const parentElement = $(e.target).parent();
                parentElement.addClass("d-none");
                parentElement.parent().find(".img_arrow").addClass("d-none");
                parentElement.removeClass('active_even_timeline');
                parentElement.removeClass('active_odd_timeline');
                e.stopPropagation()
                if ($(".active_even_timeline").length == 0) {
                    $("#timelineHistory ol").css("padding-top", "20px");
                }
                if ($(".active_odd_timeline").length == 0) {
                    $("#timelineHistory ol").css("padding-bottom", "20px");
                }
            })
        }
    })
}

var ArrComponentHandover = [];

function renderChangeComponent(arrchangeComponentDevice) {
    var counts = {};
    var html = ''
    arrchangeComponentDevice.forEach((element, i) => {
        if (typeof (element) == "object") {
            html += `<div>`
            for (const key in element) {
                if (Object.hasOwnProperty.call(element, key)) {
                    const el = element[key];
                    if (Array.isArray(el)) {
                        el.forEach((e, index) => {
                            if (index == (el.length - 1)) {
                                html += `${e}`
                            } else {
                                html += `${e}, `
                            }
                        })
                    } else {
                        html += `${el} `
                    }
                }
            }
            html += `</div>`
        } else {
            if (counts[element]) {
                counts[element]++;
            } else {
                counts[element] = 1;
            }
            if (i === arrchangeComponentDevice.length - 1 || arrchangeComponentDevice[i + 1] !== element) {
                if (counts[element] > 1) {
                    html += `<div>${counts[element]} x ${element}</div>`
                } else {
                    html += `<div>${element}</div>`
                }
            }
        }
    })
    return html
}

function getDeviceByType(typeDevice) {
    $("#floatingTextarea2").text("")
    $.ajax({
        ...GVS.setting(GVS.GetDeviceByTypeAndQuantity + `?type=component`, "GET"),
        success: (data) => {
            var datas = data.metadata.find(_ => _._id == typeDevice)
            let html = ""
            html += `<option class=""  value=""><b>Chọn linh kiện</b></option>`
            if (datas) {
                datas.devices = datas.devices.filter(el => parseInt(el.inventory.quantity) != 0 && el.status == 1)
                ArrComponentHandover = datas.devices
                datas.devices.forEach((elm) => {
                    if (elm.attributes.type == "chipset" || elm.attributes.type == "mainBoard" || elm.attributes.type == "PSU") {
                        html += renderMCPComponents(elm)
                    } else if (elm.attributes.type == 'ram') {
                        html += renderRamComponents(elm)
                    } else if (elm.attributes.type == "VGA") {
                        html += renderVGAComponents(elm)
                    } else {
                        html += renderHDRComponents(elm)
                    }
                })
            }
            $("#mySelect2-1").html(html)
        }
    })
}

function changePreviewSelect(e, name, id) {
    if (name == "component") {
        var componentHandover;
        componentHandover = ArrComponentHandover.find(el => el._id == $(e).val())
        $("#floatingTextarea2").text(componentHandover.note)
    }
    if ($(e).val() != "") {
        $(`#preview_select_${name}`).text($(`#${id} option:selected`).text())
    } else {
        $(`#preview_select_${name}`).text("")
    }
}

function renderMCPComponents(elm) {
    let mcpTheme = ""
    mcpTheme += `
        <option class="" value="${elm._id}">${elm.attributes.attributes.name}</option>`
    return mcpTheme
}

function renderRamComponents(elm) {
    let ramTheme = ""
    ramTheme += `
        <option class="" value="${elm._id}">${elm.attributes.attributes}</option>`
    return ramTheme
}

function renderVGAComponents(elm) {
    let elmConnector = elm.attributes.attributes.connector
    if (elmConnector.length > 1) {
        var connectorArr = elmConnector.join(" , ")
    } else {
        var connectorArr = elmConnector.join("")
    }
    let VGATheme = ""
    VGATheme += `
        <option class="" value="${elm._id}">${elm.attributes.attributes.name} ${elm.attributes.attributes.vram} ${connectorArr}</option> 
    `
    return VGATheme
}
// function renderPSUComponents(elm) {

// }
function renderHDRComponents(elm) {
    let hdrTheme = ""
    hdrTheme += `
        <option class="" value="${elm._id}">${elm.attributes.attributes.brand} ${elm.attributes.attributes.size} ${elm.attributes.attributes.type}</option> `
    return hdrTheme
}
$("#mySelect2-1").on("select2:open", function () {
    check = true
})

function handoverComponents() {
    if (!device.hasOwnProperty('staff')) {
        Swal.fire({
            title: "Thông báo!",
            text: 'Không thể bàn giao do case chưa có ai sử dụng!',
            icon: "error",
            confirmButtonText: "OK",
        })
    } else {

        const dataNote = $("#floatingTextarea2").val()
        const staffId = device.staff._id
        const numCase = device.attributes.num
        var deviceId
        if (check) {
            deviceId = $('#mySelect2-1 option:selected').val()
        } else {
            deviceId = ''
        }
        if (deviceId == "") {
            Swal.fire({
                title: "Thông báo!",
                text: 'Vui lòng chọn linh kiện để thêm!',
                icon: "error",
                confirmButtonText: "OK",
            })
        } else {
            $.ajax({
                ...GVS.setting(GVS.Hanover, "POST", {
                    staff: staffId,
                    deviceId,
                    note: dataNote,
                    numCase,
                    count: 1
                }),
                success: (data) => {
                    if (data.success == 1) {
                        Swal.fire({
                            title: "Thông báo!",
                            text: data.message,
                            icon: "success",
                            confirmButtonText: "OK",
                        }).then(() => {
                            $('#modal-components').modal('toggle')
                            getDataDevice()
                            $("#preview_select_component").text("")
                        })
                    } else {
                        Swal.fire({
                            title: "Thông báo!",
                            text: data.message,
                            icon: "error",
                            confirmButtonText: "OK",
                        })
                    }
                }
            })
        }

    }

}

function deleteDataComponent() {
    $('#mySelect2-1').empty()
    $('#mySelect2-1').append('<option  class=""  value="" ><b>Chọn linh kiện</b></option>')
    $('#floatingTextarea2').val("")
    $("#preview_select_component").text("")
    check = false
}