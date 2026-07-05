module.exports = {
    USER: {
        ADMIN: 0,
        TECHNIQUE: 1,
        ACCOUNTANT: 2,
        STAFF: 3
    },
    STATUS_REQUIRE: {
        REJECTED: 0, // Từ chối tổng quát
        ACCEPTED: 1, // Chấp thuận tổng quát
        PENDING: 2, // Đang chờ xử lý
        APPROVED_BY_ACCOUNTANT: 3, // Hành chính duyệt
        REJECTED_BY_ACCOUNTANT: 4, // Hành chính từ chối
        APPROVED_BY_TECH: 5, // Kỹ thuật duyệt
        REJECTED_BY_TECH: 6, // Kỹ thuật từ chối
    }
    
}