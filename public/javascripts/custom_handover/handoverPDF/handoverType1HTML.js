let arrDeviceSort = [
  "case",
  "monitor",
  "wacom",
  "headphone",
  "webcam",
  "component",
  "ups",
  "mouse",
  "keyboard",
];
export function handoverType1HTML(elm, dataDate, typeComponentObj) {
  let htmls = "";
  htmls += `
        <div class="first_part text-center">
            <h4><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></h4>
            <h5>Độc lập - Tự do - Hạnh phúc</h5>
            <div class="back_ground d-flex justify-content-center">
                <div class="div p-1 ">
                    <p style="width: 256px; background-color: black; height: 1px;"></p>
                </div>
            </div>
            <div class="begin text-center">
                <h3><strong>BIÊN BẢN BÀN GIAO MÁY MÓC, THIẾT BỊ</strong></h3>
                <i>Hôm nay, ngày ${dataDate.day} tháng ${dataDate.month} năm ${
    dataDate.year
  }, tại văn phòng ${typeComponentObj[elm.staff.company]}</i>
            </div>
        </div>
        <div class="sender">
            <div><strong style="font-size: 1.1rem;">Bên giao: ${
              typeComponentObj[elm.staff.company]
            }</strong></div>
            <div class="row">
                <div>Đại diện:</div>
            </div>
            <div class="row ps-5 py-1">
                <div class="col-4">Ông/ Bà: ${GVS.deputy.accountant}</div>
                <div class="col-auto">Bộ phận: Hành chính kế toán</div>    
            </div>
            <div class="row ps-5 pb-1">
                <div class="col-4">Ông/ Bà: ${
                  elm.staff.company === "Minh Việt"
                    ? `${GVS.deputy.techniqueMV}`
                    : `${GVS.deputy.techniquePlus}`
                }</div>
                <div class="col-auto">Bộ phận: Kĩ thuật</div>    
            </div>
        </div>
        <div>
            <div><strong style="font-size: 1.1rem;">Bên nhận:</strong></div>
            <div class="row ps-5 py-1">
                <div class="col">Ông/ Bà: ${elm.staff.name}</div>
            </div>
            <div class="row justify-content-center ps-5 pb-1">
                <div class="col-4">
                    <span>Vị trí công tác: ${elm.staff.position.name}</span>
                </div>
                <div class="col-3">
                    <span>Bộ phận: ${elm.staff.department.name}</span>
                </div>
                <div class="col-5">
                    <span>Tầng: ${elm.staff.location.floor} - ${
    elm.staff.location.address
  }</span>
                </div>
            </div>
        </div>
        <i class="pb-2">Cùng nhau tiến hành bàn giao bổ sung máy móc, thiết
            bị như
            sau:</i>
        <table class="table table-bordered  border-dark text-center">
            <thead>
                <tr>
                    <th scope="col-1">STT
                    </th>
                    <th scope="col-2">TÊN MMTB
                    </th>
                    <th scope="col-3">MÔ TẢ MMTB
                    </th>
                    <th scope="col-1">ĐƠN VỊ TÍNH
                    </th>
                    <th scope="col-2">SỐ LƯỢNG
                    </th>
                    <th scope="col-2">TÌNH TRẠNG
                    </th>

                </tr>
            </thead>
            <tbody>`;
  sortArrayByAnotherArray(elm.deviceHandover, arrDeviceSort);
  elm.deviceHandover.forEach((e, index) => {
    var attributes = e.attributes;
    if (e.type === "case") {
      htmls += `
                                <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td>Máy gồm:</td>
                                    <td>${e.type} - ${e.attributes.num}</td>
                                    <td>Bộ</td>
                                    <td>1</td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                <tr>   
                                    <th scope="row"></th>
                                    <td>Chip set</td>
                                    <td>`;
      if (e.type === "case") {
        htmls += `${e.attributes.chipset}`;
      }
      htmls += `
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                <tr>
                                    <th scope="row"></th>
                                    <td>Ram</td>
                                    <td>`;
      if (e.type === "case") {
        attributes.ram.forEach((ram) => {
          htmls += `<div>${ram}</div>`;
        });
      }
      htmls += `
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                <tr>
                                    <th scope="row"></th>
                                    <td>VGA</td>
                                    <td>`;
      if (e.type === "case") {
        attributes.VGA.forEach((vga) => {
          htmls += `<div>${vga.name} ${vga.vram}</div>`;
        });
      }
      htmls += `
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                <tr>
                                    <th scope="row"></th>
                                    <td>Ổ cứng</td>
                                    <td>`;
      if (e.type === "case") {
        attributes.hardDrives.forEach((hardDrives) => {
          htmls += `<div>${hardDrives.size} ${hardDrives.type}</div>`;
        });
      }
      htmls += `
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                `;
    }
    if (e.type === "monitor") {
      htmls += `
                                    <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td>Màn hình</td>
                                    <td>${e.name}</td>
                                    <td>Cái</td>
                                    <td>1</td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                    `;
    }
    if (e.type === "wacom") {
      htmls += `
                                    <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td>Wacom</td>
                                    <td>${e.name}</td>
                                    <td>Cái</td>
                                    <td>1</td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                    `;
    }
    if (e.type === "headphone") {
      htmls += `
                                <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td>Tai nghe</td>
                                    <td>${e.name}</td>
                                    <td>Cái</td>
                                    <td>1</td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                    `;
    }
    if (e.type === "webcam") {
      htmls += `
                                <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td>Webcam</td>
                                    <td>${e.name}</td>
                                    <td>Cái</td>
                                    <td>1</td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                    `;
    }
    if (e.type === "ups") {
      htmls += `
                                <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td>Ups</td>
                                    <td>${e.name}</td>
                                    <td>Cái</td>
                                    <td>1</td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                    `;
    }
    if (e.type === "mouse") {
      htmls += `
                                <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td>Chuột</td>
                                    <td>${typeComponentObj[e.type]}</td>
                                    <td>Cái</td>
                                    <td>1</td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                    `;
    }
    if (e.type === "keyboard") {
      htmls += `
                                <tr>
                                    <th scope="row">${index + 1}</th>
                                    <td>Bàn phím</td>
                                    <td>${typeComponentObj[e.type]}</td>
                                    <td>Cái</td>
                                    <td>1</td>
                                    <td>Sử dụng bình thường</td>
                                </tr>
                                    `;
    }
  });

  htmls += `
                        </tbody>
                        </table>
                        <div class="note">
                            <ul>
                                <li>Bên giao đã giao đủ và bên nhận đã nhận đủ máy móc thiết bị theo biên
                                    bản này và đảm
                                    báo máy móc thiết bị khi bàn giao đang sử dụng tốt.</li>
                                <li>Bên nhận không được tự ý trao đổi, bàn giao máy móc thiết bị cho người
                                    khác mà không
                                    thông báo và được sự đồng ý của Trưởng bộ phận mình và bộ phận Hành chính
                                    – Kế toán.
                                </li>
                                <li>Bên nhận có trách nhiệm bảo quản, cất giữ máy móc thiết bị trong suốt
                                    quá trình sử
                                    dụng. Nếu gặp sự cố trong quá trình sử dụng phải báo ngay cho Trưởng bộ
                                    phận để kịp
                                    thời xử lý. </li>
                                <li>Bên nhận sẽ có trách nhiệm bồi thường các thiệt hại do mình gây ra nếu
                                    máy móc thiết
                                    bị bị hư hỏng, mất trong quá trình bên nhận đang sử dụng máy móc thiết
                                    bị.</li>
                            </ul>
                        </div>
                        <div class="the_end text-end">
                            <i id="time_report">Hà Nội, Ngày ${
                              dataDate.day
                            } tháng ${dataDate.month} năm ${dataDate.year}</i>
                        </div>
                        <div class="row row-cols-3">
                            <div class="col-6 text-center">
                                <div class="row flex-column justify-content-around text-center">
                                    <div class="col-12 text-center">
                                        <div class="row">
                                            <div class="col-12 text-center"><strong style="font-size: 14px;">BÊN
                                                GIAO</strong></div>
                                        </div>
                                    </div> 
                                    <div class="col-12" text-center>
                                        <div class="row">
                                            <div class="col-6 text-center">
                                                <div class="row">
                                                    <div class="col-12 text-center">
                                                        <div class="row flex-column">
                                                            <div class="col-12 text-center"><strong style="font-size: 14px;">KẾ
                                                                TOÁN</strong></div>
                                                            <div class="col-12 text-center mt-5"><strong style="font-size: 14px;">${
                                                              GVS.deputy
                                                                .accountant
                                                            }</strong></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-6 text-center">
                                                <div class="row">
                                                    <div class="col-12 text-center">
                                                        <div class="row flex-column">
                                                            <div class="col-12 text-center"><strong style="font-size: 14px;">KỸ
                                                                THUẬT</strong></div>
                                                            <div class="col-12 text-center mt-5"><strong style="font-size: 14px;">${
                                                              elm.staff
                                                                .company ===
                                                              "Minh Việt"
                                                                ? `${GVS.deputy.techniqueMV}`
                                                                : `${GVS.deputy.techniquePlus}`
                                                            }</strong></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>    
                                        </div>    
                                    </div>
                                </div>
                            </div>
                            <div class="col-3 text-center" style="margin-top: 21px;">
                                <div class="row flex-column justify-content-between">
                                    <div class="col-12 text-center"><strong style="font-size: 14px;">BÊN
                                            NHẬN</strong></div>
                                    <div class="col-12 text-center mt-5"><strong style="font-size: 14px;">${
                                      elm.staff.name
                                    }</strong></div>
                                </div>
                            </div>
                            <div class="col-3 text-center" style="margin-top: 21px;">
                                <div class="row flex-column justify-content-between">
                                    <div class="col-12 text-center"><strong style="font-size: 14px;">TRƯỞNG BỘ
                                            PHẬN</strong></div>
                                    <div class="col-12 text-center mt-5"><strong style="font-size: 14px;">${
                                      elm.staff.manager
                                        ? elm.staff.manager.name
                                        : elm.staff.company == "Minh Việt"
                                        ? `${GVS.nameLeaderMV}`
                                        : `${GVS.nameLeaderPlus}`
                                    }</strong></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 text-center py-5">`;
  if (elm.isOpen === true) {
    htmls += `
                    <button type="button" class="btn bg-color-all c-white" data-bs-toggle="modal"
                    data-bs-target="#exampleModal" style="width: 200px; height: 50px; position: relative" onclick="printPDF('${elm._id}')">
                        Xuất Phiếu
                    </button>
                `;
  } else {
    htmls += `
                    <button type="button" class="btn bg-color-all c-white" data-bs-toggle="modal"
                    data-bs-target="#exampleModal" style="width: 200px; height: 50px; position: relative">
                        <a href="/handover/${elm._id}.pdf" id="preview" target="_blank"  style="    position: absolute;top: 50%;left: 50%;transform: translate(-50%, -25%);width: 100%;height: 100%;" class="text-decoration-none text-white">
                            <span>In Phiếu</span>
                        </a>
                    </button>
                `;
  }
  htmls += `</div>
            `;
  return htmls;
}
