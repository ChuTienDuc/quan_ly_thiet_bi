var dataComponent

function renderOptionSupplier() {
    $.ajax({
        ...GVS.setting(GVS.GetAllSupplier, "GET"),
        success: (res) => {
            var html = ''
            res.metadata.forEach((el) => {
                html += `<option value = "${el._id}">${el.name}</option>`
            })
            $("#supplier_addcomponent").html(html)
            $("#supplier_updatecomponent").html(html)

        }
    })
}

function getAllComponent() {
    $.ajax({
        ...GVS.setting(GVS.GetAllDeciveByType, "POST", { type: "component" }),
        success: (res) => {
            dataComponent = res.metadata
            renderMain(res.metadata)
            renderOptionSupplier()
        }
    })


}

function renderMain(device) {
    var typeComponentObj = {
        "ram": "Ram",
        "hardDrives": "Ổ cứng",
        "chipset": "Chip set",
        "mainBroard": "Bo mạch chủ"
    }
    var html = '';
    device.forEach(el => {
        html += `
            <tr class= "align-middle text-center">
            <td class ="p-1">
                    <a data-bs-toggle="modal" data-bs-target="#updateComponent" onclick ="changeInputUpdate('${el._id}')">
                <i class='fa fa-pencil text-primary p-2'  style ="font-size: 1.5rem ;"></i>
                </a>
            </td>
            <td>${typeComponentObj[el.attributes.type]}</td>
            <td>${el.name}</td>
            <td>${renderByTypeComponent(el.attributes.attributes)}</td>
            <td>${el.supplier.name}</td>
            <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(el.billPrice)}</td>
            <td>${new Date(el.createdAt).toLocaleDateString('vi-VN')}</td>
            <td>${new Date(el.expirationDate).toLocaleDateString('vi-VN')}</td>
            <td>${el.note}</td>
            <td>${el.status}</td>
            </tr>`
    });
    $("#dataComponent").html(html)
    $("#table_component").DataTable({
        "pageLength": 50,
        lengthMenu: [20, 40, 50, 100, 200, 500],
    });

}

function renderByTypeComponent(attributes) {
    if (typeof (attributes) == "object") {
        const result = Object.keys(attributes)
            .map(key => `${attributes[key]}`)
            .join(' ');
        return result
    } else {
        return attributes
    }

}

function changeAddComponent(value, action) {
    var html = '';
    if (value != "VGA" && value != "hardDrives") {
        html = `<div class="col-3">
                        <label class="col-form-label" style = "text-transform: capitalize;">${value}: </label>
                    </div>
                    <div class="col-7 mb-2">
                        <input type="text" id = "${value}_${action}" name="${value}" list="datalist${value}" autocomplete="off"
                            class="form-control" placeholder="Nhập ${value}">
                        <div class="invalid-feedback">Vui lòng nhập ${value}</div>
                    </div>`
    } else if (value == "VGA") {
        html = `<div class="row justify-content-center">
                            <div class="col-2">
                                <label class="col-form-label" for="VGA_name_${action}">VGA: </label>
                            </div>
                            <div class="col-4 mb-2">
                                <input type="text" id="VGA_name_${action}" name="vga" autocomplete="off" list="datalistvga" class="form-control" placeholder="Nhập VGA">
                                <div class="invalid-feedback">Vui lòng nhập VGA</div>
                            </div>
                            <div class="col-3 mb-2">
                                <input type="text" autocomplete="off" id="VGA_vram_${action}" name="vram" list="datalistvram" class="form-control" placeholder="Nhập VRAM">
                                <div class="invalid-feedback">Vui lòng nhập Vram</div>

                            </div>
                            </div>
                            <div class="col-12">
                                <div class="row">
                                    <div class="col-2"></div>
                                    <div class="col-2">
                                        <label class="col-form-label" for="VGA_connector_${action}">Connector:
                                        </label>
                                    </div>
                                    <div class="col-4 ps-4 ms-1">
                                        <select class="form-select form-select-md connector" list="datalistconnector" id = "VGA_connector_${action}" name = "connector" aria-label=".form-select-lg example">
                                            <option value="VGA">VGA</option>
                                            <option value="DVI">DVI</option>
                                            <option value="HDMI" selected="">HDMI</option>
                                            <option value="DisplayPort">DisplayPort</option>
                                            <option value="Mini-DP">Mini-DP</option>
                                            <option value="Type-C">Type-C</option>
                                        </select>
                                    </div>
                                    <div class="col-1 ps-0">
                                        <button class="btn btn-primary" onclick="addConnector(this)">
                                            <i class="fa fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>`
    } else if (value == "hardDrives") {
        html = `<div class="row justify-content-center ps-5">
                            <div class="col-3">
                                <label for="hardDrives_addComponent" class="col-form-label">Ổ cứng: </label>
                            </div>
                            <div class="col-3">
                                <input type="number" name="size" id = "hardDrives_size_${action}" list="datalistsize" autocomplete="off" class="form-control" min="0" placeholder="Size" onblur="fomatValue(this)">
                                <div class="invalid-feedback">Vui lòng nhập size</div>
                            </div>
                            <div class="col-3">
                                <select class="form-select" id = "hardDrives_type_${action}" name="type" aria-label="Default select example">
                                    <option value="SSD" selected="">SSD</option>
                                    <option value="HDD">HDD</option>
                                    <option value="M2">M2</option>
                                </select>
                                <div class="invalid-feedback">Vui lòng nhập type</div>

                            </div>
                            <div class="col-3">
                                <input type="text" name="brand" id ="hardDrives_brand_${action}" list="datalistbrand" autocomplete="off" class="form-control" placeholder="Brand">
                                <div class="invalid-feedback">Vui lòng nhập brand</div>

                            </div>
                        </div>`
    }
    if (action == "create") {
        $("#add_component").html(html)
    } else {
        $("#update_component").html(html)
    }

}

function getInputAttributes(action) {
    var arrconnector = []
    var inputConnector = $(`select[name ^= connector]`);
    for (i = 0; i < inputConnector.length; i++) {
        let el = inputConnector[i];
        arrconnector.push(el.value);
    }
    var attributes;
    if ($("#type_add_component").val() == "ram") {
        attributes = $("#ram" + action).val()
    } else if ($("#type_add_component").val() == "PSU" || $("#type_add_component").val() == "mainBoard" || $("#type_add_component").val() == "chipset") {
        if ($("#type_add_component").val() == "PSU") {
            parseInt($(`#` + $("#type_add_component" + action).val()).val())
        }
        attributes = {
            name: $(`#` + $("#type_add_component" + action).val()).val()
        }
    } else if ($("#type_add_component").val() == "VGA") {
        attributes = {
            name: $("#VGA_name" + action).val(),
            vram: $("#VGA_vram" + action).val(),
            connector: arrconnector
            // connector: $("#VGA_connector" + action).val()
        }
    } else if ($("#type_add_component").val() == "hardDrives") {
        attributes = {
            size: $("#hardDrives_size" + action).val(),
            type: $("#hardDrives_type" + action).val(),
            brand: $("#hardDrives_brand" + action).val()
        }
    }
    return attributes
}

function addConnector(e) {
    $(e).parent().parent().parent().parent().append(`
            <div class="col-12 mt-4">
                <div class="row">
                    <div class="col-2"></div>
                    <div class="col-2">
                        <label class="col-form-label" for="VGA_connector_create">Connector:
                        </label>
                    </div>
                    <div class="col-4 ps-4 ms-1">
                        <select class="form-select form-select-md connector" list="datalistconnector" id="VGA_connector_create" name = "connector" aria-label=".form-select-lg example">
                            <option value="VGA">VGA</option>
                            <option value="DVI">DVI</option>
                            <option value="HDMI" selected="">HDMI</option>
                            <option value="DisplayPort">DisplayPort</option>
                            <option value="Mini-DP">Mini-DP</option>
                            <option value="Type-C">Type-C</option>
                        </select>
                    </div>
                    <div class="col-1 ps-0">
                        <button class="btn btn-danger" onclick="removeConnector(this)"><i class="fa fa-minus"></i></button>
                    </div>
                </div>
            </div>`);
}

function removeConnector(e) {
    $(e).parent().parent().parent().remove()
}

function createComponent() {
    var supplierVal = $("#supplier_addcomponent").val();
    var billPriceVal = parseInt($("#bill_price").val().replace(',', ""));
    var totalPriceVal = parseInt($("#total_price").val().replace(',', ""));
    var dataCreateComponent = {
        name: $("#name_addcomponent").val(),
        supplier: supplierVal || undefined,
        type: "component",
        location: {
            "address": "1C Định Công Thượng",
            "floor": "Tầng 5"
        },
        attributes: {
            type: $("#type_add_component").val(),
            attributes: getInputAttributes("_create")
        },
        billPrice: isNaN(billPriceVal) ? undefined : billPriceVal,
        totalPrice: isNaN(totalPriceVal) ? undefined : totalPriceVal,
        expirationDate: $("#expirationDate").val(),
        note: $("#note_addcomponent").val(),
        total: parseInt($("#quantity").val()) || 1
    }
    $.ajax({
        ...GVS.setting(GVS.CreateDevice, "POST", dataCreateComponent),
        success: (res) => {
            if (res.success == 1) {
                Swal.fire({
                    title: "Thông báo!",
                    text: res.message,
                    icon: "success",
                    confirmButtonText: "OK",
                }).then((result) => {
                    $("#button_cancel_create_component").click()
                    getAllComponent()

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

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function changeInputUpdate(id) {
    $("#button_update_component").attr("onclick", `updateComponent('${id}')`)
    dataComponent.forEach((component) => {
        if (component._id == id) {
            $("#type_update_component").val(component.attributes.type)
            $("#bill_price_update").val(component.billPrice).attr("disabled", true)
            $("#total_price_update").val(component.totalPrice)
            $("#name_updatecomponent").val(component.name)
            $("#expirationDate_updatecomponent").val(formatDate(component.expirationDate))
            $("#note_updatecomponent").val(component.note)

            $("#type_update_component").attr("disabled", true)
            changeAddComponent(component.attributes.type, "update")
            if (component.attributes.type == "ram" || component.attributes.type == "PSU" || component.attributes.type == "mainBoard" || component.attributes.type == "chipset") {
                $(`#${component.attributes.type}_update`).val(component.attributes.attributes)
            } else if (component.attributes.type == "VGA") {

                $("#VGA_name_update").val(component.attributes.attributes.name)
                $("#VGA_vram_update").val(component.attributes.attributes.vram)
                $("#VGA_connector_update").val(component.attributes.attributes.connector)
            } else if (component.attributes.type == "hardDrives") {

                $("#hardDrives_size_update").val(component.attributes.attributes.size)
                $("#hardDrives_type_update").val(component.attributes.attributes.type)
                $("#hardDrives_brand_update").val(component.attributes.attributes.brand)
            }
        }
    })
}

function updateComponent(id) {
    var supplierUpdateVal = $("#supplier_updatecomponent").val();
    var totalPriceUpdateVal = parseInt($("#total_price_update").val().replace(',', ""));
    var dataUpdateComponent = {
        type: "component",
        name: $("#name_updatecomponent").val(),
        supplier: supplierUpdateVal || undefined,
        attributes: {
            attributes: getInputAttributes("update")
        },
        totalPrice: isNaN(totalPriceUpdateVal) ? undefined : totalPriceUpdateVal,
        expirationDate: $("#expirationDate_updatecomponent").val(),
        note: $("#note_updatecomponent").val(),
    }
    $.ajax({
        ...GVS.setting(GVS.UpdateDevice + `${id}`, "PATCH", dataUpdateComponent),
        success: (res) => {
            if (res.success == 1) {
                Swal.fire({
                    title: "Thông báo!",
                    text: res.message,
                    icon: "success",
                    confirmButtonText: "OK",
                }).then((result) => {
                    $("#button_cancel_update_component").click()
                    getAllComponent()

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
$(document).ready(() => {
    getAllComponent()
})