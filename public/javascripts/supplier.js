function renderModalCreateSupplier() {
    var html = `<div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title color_header" id="exampleModalToggleLabel2">Tạo thêm nhà cung cấp</h3>
            <button type="button" class="btn-close" data-bs-target="#addDevice" data-bs-toggle="modal" onclick = "deleteInputSupplier()"></button>
        </div>
        <div class="modal-body container">
            <div class="row justify-content-center">
                <div class="col-6 mb-3">
                    <div class="row justify-content-center">
                        <div class="col-4">
                            <label for="name_supplier" class="col-form-label color_title">Tên:
                            </label>
                        </div>
                        <div class="col-7">
                            <input type="text" id="name_supplier" class="form-control  py-1" placeholder="Nhập tên">
                            <div class="invalid-feedback">Vui lòng nhập tên</div>
                        </div>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="row justify-content-center">
                        <div class="col-3" style="margin-left: 10px;">
                            <label for="address_supplier" class="col-form-label color_title">Địa chỉ:
                            </label>
                        </div>
                        <div class="col-8">
                            <input type="text" id="address_supplier" class="form-control py-1" placeholder="Nhập địa chỉ">
                            <div class="invalid-feedback">Vui lòng nhập địa chỉ</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-6 mb-3">
                    <div class="row justify-content-center">
                        <div class="col-4" style="
    margin-left: 10px;
">
                            <label for="phone_supplier" class="col-form-label color_title" style="width: max-content;">Số điện thoại:
                            </label>
                        </div>
                        <div class="col-7">
                            <input type="text" id="phone_supplier" class="form-control py-1" placeholder="Nhập số điện thoại" style="
">
                            <div class="invalid-feedback">Vui lòng nhập số điện thoại</div>
                        </div>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="row justify-content-center">
                        <div class="col-3">
                            <label for="vat_supplier" class="col-form-label color_title">Thuế:
                            </label>
                        </div>
                        <div class="col-8">
                            <input type="text" id="vat_supplier" class="form-control  py-1" onclick="changePercent(this)" onblur="convertToPercentage()" placeholder="Nhập VAT">
                            <div class="invalid-feedback">Vui lòng nhập VAT</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-danger" data-bs-target="#addDevice" data-bs-toggle="modal" onclick = "deleteInputSupplier()">Trở
                về</button>
            <button class="btn btn-success" onclick="createSupplier(this)">Tạo</button>
        </div>
    </div>
</div>`
    $("#create_supplier").html(html)
}
function convertToPercentage() {
    var inputElement = document.getElementById("vat_supplier");
    var inputValue = inputElement.value;

    if (inputValue != '') {
        inputElement.value = inputValue + "%";
    }
}
$(document).ready(() => {
    renderModalCreateSupplier()
})
function changePercent(e) {
    $(e).val($(e).val().replace("%", ''))
    if ($(e).val() != '') {
        $(e).val(Number($(e).val()))
        $(e).select()
    }

}
function createSupplier(e) {
    var dataCreate = {
        name: $("#name_supplier").val(),
        phoneNumber: $("#phone_supplier").val(),
        VAT: parseInt($("#vat_supplier").val()),
        address: $("#address_supplier").val()
    }
    $.ajax({
        ...GVS.setting(GVS.CreateSupplier, "POST", dataCreate),
        success: (respone) => {
            if (respone.success == 1) {
                Swal.fire({
                    title: "Thông báo!",
                    text: respone.message,
                    icon: "success",
                    confirmButtonText: "OK",
                }).then((result) => {
                    $(e).parent().children()[0].click()
                    renderOptionSupplier()
                });
            } else {
                Swal.fire({
                    title: "Thông báo!",
                    text: respone.message,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        }
    })
}
function deleteInputSupplier() {
    $("#name_supplier").val("")
    $("#phone_supplier").val("")
    $("#vat_supplier").val("")
    $("#address_supplier").val("")
}