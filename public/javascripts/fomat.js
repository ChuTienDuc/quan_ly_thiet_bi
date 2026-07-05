
$("#total_price").on({
    keyup: function (event) {
        if (event.ctrlKey || event.key == 'a') {
            event.preventDefault();
            $(this).select();
            return
        }
        formatCurrency($(this));
        document.getElementById("total_price").value = document.getElementById("bill_price").value;
    },
});

$("#bill_price").on({
    keyup: function (event) {
        if (event.ctrlKey || event.key == 'a') {
            event.preventDefault();
            $(this).select();
            return
        }
        formatCurrency($(this));
        document.getElementById("total_price").value = document.getElementById("bill_price").value;
    },
});

if ($("#total_price_update") && $("#bill_price_update")) {
    $("#total_price_update").on({
        keyup: function (event) {
            if (event.ctrlKey || event.key == 'a') {
                event.preventDefault();
                $(this).select();
                return
            }
            formatCurrency($(this));
            document.getElementById("total_price").value = document.getElementById("bill_price").value;
        },
    });
    
    $("#bill_price_update").on({
        keyup: function (event) {
            if (event.ctrlKey || event.key == 'a') {
                event.preventDefault();
                $(this).select();
                return
            }
            formatCurrency($(this));
            document.getElementById("total_price").value = document.getElementById("bill_price").value;
        },
    });
}

function formatNumber(n) {
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
function formatCurrency(input) {
    var input_val = input.val();
    if (input_val === "") { return; }
    var original_len = input_val.length;
    var caret_pos = input.prop("selectionStart");
    if (input_val.indexOf(".") >= 0) {
        var decimal_pos = input_val.indexOf(".");
        var left_side = input_val.substring(0, decimal_pos);
        var right_side = input_val.substring(decimal_pos);
        left_side = formatNumber(left_side);
        right_side = formatNumber(right_side);
    } else {
        input_val = formatNumber(input_val);
    }
    input.val(input_val);
    var updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;
    input[0].setSelectionRange(caret_pos, caret_pos);
}
// TODO Default expirationDate
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
document.getElementById("expirationDate").defaultValue = formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6)))
if (document.getElementById("quantity")) {
    document.getElementById("quantity").defaultValue = 1
}
