module.exports = {
    DEVICE: {
        CAN_USE: 1,
        FAILED: -1,
        IN_USE: 0
    },
    DEVICE_MESSAGE: {
        '1': 'Thiết bị có thể sử dụng!',
        '-1': 'Thiết bị đang hỏng!',
        '0': 'Thiết bị đang trong sử dụng!',
        NOT_FOUND:'Không tìm thấy thiết bị!'
    },
    DEVICE_TYPE: {
        CASE: 'case',
        WACOM: 'wacom',
        MONITOR: 'monitor',
        COMPONENT: 'component',
        HEADPHONE: 'headphone',
        WEBCAM: 'webcam',
        UPS:'ups',
        KEYBOARD:'keyboard',
        MOUSE:'mouse'
    }
}