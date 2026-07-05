function renderDeviceByStatus(data,datas) {
    const urlParams = new URLSearchParams(window.location.search);
            const myParam = urlParams.get('status');
            if (myParam == 1) {
                datas = data.filter(_ => _.status == myParam)
            }else if(myParam == -1){
                datas = data.filter(_ => _.status == myParam)
            }
            else {
                datas = data
            }
            return datas
}