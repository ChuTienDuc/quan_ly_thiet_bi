
document.addEventListener("DOMContentLoaded", function (event) {

    const showNavbar = (toggleId, navId, bodyId, headerId) => {
        const toggle = document.getElementById(toggleId),
            nav = document.getElementById(navId),
            bodypd = document.getElementById(bodyId),
            headerpd = document.getElementById(headerId)

        // Validate that all variables exist
        if (toggle && nav && bodypd && headerpd) {
            toggle.addEventListener('click', () => {
                // show navbar
                nav.classList.toggle('shownav')
                // change icon
                toggle.classList.toggle('bx-x')
                // add padding to body
                bodypd.classList.toggle('body-pd')
                // add padding to header
                headerpd.classList.toggle('body-pd')
            })
        }
    }

    showNavbar('header-toggle', 'nav-bar', 'body-pd', 'header')

    /*===== LINK ACTIVE =====*/
    const linkColor = document.querySelectorAll('.nav_link')

    function colorLink() {
        if (linkColor) {
            linkColor.forEach(l => l.classList.remove('active'))
            this.classList.add('active')
        }
    }
    linkColor.forEach(l => l.addEventListener('click', colorLink))
    var role = GVS.getUserId("role")
    if(role && role != 0 ){
        $("#manage-account").remove()
    }
    if(role && role == 3 ){
        $("#manage-account").remove()
        $("#manage-jdp").remove()
        $("#manage-lk").remove()
        $("#manage-handover").remove()
        $("#manage-km").remove()
        $("#manage-device").remove()
        $("#manage-staff").remove()
        $("#btn_handover").remove()
        $("#manage-require-device").remove()
    }
    if(role && role == 1 ){
        $("#manage-account").remove()
        $("#manage-jdp").remove()
        $("#manage-handover").remove()
        $("#manage-staff").remove()
        $("#manage-require-device").remove()
    }
    if(role && role == 2 ){
        $("#manage-lk").remove()
        $("#manage-km").remove()
    }
});

