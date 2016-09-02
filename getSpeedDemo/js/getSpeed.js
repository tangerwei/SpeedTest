//测试网速
var test = {
    showData: [],
    _buttonId: '',
    _testStartus:true,//记录本次测试成功或者失败
    getSpeed: function(buttonId) {
        var _self = this;
        var isgetSpeed = false;
        _self._buttonId = buttonId;
        $("#" + buttonId).on('click', function() {
            if(isgetSpeed) {
                //防止多次点击
                return;
            }
            config.setUrl("IpAddress");
            config.getUrl();
            $("#" + buttonId).text("测速中");
            _self._testStartus=true;
            _self.showData = [];
            _self.testStart();
            _self.drawReport();
            $("#" + buttonId).text("重新测试");
        });
    },
    testStart: function() {
        if(config.downloadUrls.length != "") {
            for(var i = 0; i < config.downloadUrls.length; i++) {
                //1M 2M 5M 10M
                var _url = config.downloadUrls[i];
                this.xhrText("GET", _url, null);
            }
        }
        if(config.uploadUrl != "") {
            var _url = config.uploadUrl;
            var _1Mdata = this.createData();
            //1M upload
            this.xhrText("POST", _url, _1Mdata);
            var _string = "";
            //2M upload
            _string = _1Mdata + _1Mdata;
            this.xhrText("POST", _url, _string);
            //5M upload
            for(var i = 0; i < 3; i++) {
                _string = _string + _1Mdata;
            }
            this.xhrText("POST", _url, _string);
            //10M upload
            for(var i = 0; i < 5; i++) {
                _string = _string + _1Mdata;
            }
            this.xhrText("POST", _url, _string);
        }
    },
    xhrText: function(method, url, data) {
        if(!this._testStartus){
            return;
        }
        var _self = this;
        var xhr = new XMLHttpRequest();
        //绕过缓存
        url = url + "?" + Math.floor(Math.random() * 10000);
        xhr.open(method, url, false);
        var _start = new Date();
        if(method === "GET") {
            /*xhr.onerror = function() {
                console.log("download onerror");
                $("#" + _self._buttonId).text("重新测试");
                _self._testStartus=false;
                _self.drawReport();
            }*/
            xhr.onload = function() {
                if(this.status == 200) {
                    var _end = new Date();
                    //计算文件大小，访问方式，访问时间
                    var _size=this.getResponseHeader("Content-Length");
                    var _internal=_end.getTime() - _start.getTime();
                    var _mesg = {
                        _size:""+(parseInt(_size)/1024/1024).toFixed(2)+"M",
                        _internal:""+(parseInt(_internal)/1000).toFixed(3)+"s",
                        _speed:""+Math.floor(parseInt(_size)/_internal*1000/1024)+"KB/s",
                        type: "download"
                    }
                    _self.showData.push(_mesg);
                }
            }
            xhr.onloadend=function(){
                if(this.status !== 200){
                    $("#" + _self._buttonId).text("重新测试");
                    _self._testStartus=false;
                    _self.drawReport();
                }
            }
            xhr.send();
        } else {
            var _data = new FormData();
            _data.append("operation", "uploadtest");
            _data.append("payload", data);
            /*xhr.onerror = function() {
                console.log("upload onerror");
                $("#" + _self._buttonId).text("重新测试");
                _self._testStartus=false;
                _self.drawReport();
            }*/
            xhr.onload = function() {
                if(this.status == 200) {
                    var result = JSON.parse(this.response);
                    //解析
                    if(result.rc === "0") {
                        result = result.rcstring.split(" ");
                        var _mesg = {
                            _size:""+(parseInt(result[1])/1024/1024).toFixed(2)+"M",//文件大小
                            _internal:""+(parseInt(result[5])/1000000).toFixed(2)+"s" ,//上传时间
                            _speed: result[9],//平均速度
                            _speed_limited:result[13],//速度限制
                            type: "upload"
                        }
                    }else{
                        var _mesg={
                            //上传失败
                            _log:result
                        }
                    }
                    _self.showData.push(_mesg);
                }
            }
            xhr.onloadend=function(){
                if(this.status !== 200){
                    $("#" + _self._buttonId).text("重新测试");
                    _self._testStartus=false;
                    _self.drawReport();
                }
            }
            xhr.send(_data);
        }
    },
    drawReport: function() {
        var result = "";
        var average_down=0;
        var average_upload=0;
        var count_num=0;
        if(this.showData.length>0 && this._testStartus) {
            result="<table class='messageTable' style='width:70%'><caption>下载测试</caption><thead><td style='width:20%'>文件编号</td><td style='width:20%'>文件大小</td><td style='width:20%'>时间</td><td>下载速度</td></thead><tbody>";
            for(var i = 0; i < this.showData.length; i++) {
                var _data = this.showData[i];
                if(_data.type==="download"){//下载
                    var _tr="<tr><td>"+(i+1)+"</td><td>"+_data._size+"</td><td>"+_data._internal+"</td><td>"+_data._speed+"</td></tr>";
                    var speed=_data._speed.split("");
                    if(speed.length>3){
                        //去掉单位
                        speed.length=speed.length-3;
                        speed=speed.join("");
                        average_down=average_down+parseInt(speed);
                        count_num++;
                    }
                    result=result+_tr;
                }
            }
            average_down=(average_down/count_num).toFixed(2);
            result=result+"</tbody>";
            result=result+"<p>下载平均速度是："+average_down+"KB/s</p>";
            count_num=0;
            result=result+"<table class='messageTable'><caption>上传测试</caption><thead><td style='width:14%'>文件编号</td><td style='width:14%'>文件大小</td><td style='width:14%'>时间</td><td style='width:28%'>上传速度</td><td>服务器上传速度限制</td></thead><tbody>";
            for(var i = 0; i < this.showData.length; i++) {
                var _data = this.showData[i];
                if(_data.type==="upload"){//上传
                    var _tr="<tr><td>"+(i-3)+"</td><td>"+_data._size+"</td><td>"+_data._internal+"</td><td>"+_data._speed+"</td><td>"+_data._speed_limited+"</td></tr>";
                    var speed=_data._speed.split("");
                    if(speed.length>3){
                        //去掉单位
                        speed.length=speed.length-3;
                        speed=speed.join("");
                        average_upload=average_upload+parseInt(speed);
                        count_num++;
                    }
                    result=result+_tr;
                }
            }
            average_upload=(average_upload/count_num).toFixed(2);
            result=result+"</tbody>";
            result=result+"<p>上传平均速度是："+average_upload+"KB/s</p>";
            document.getElementById("dialogDetails").innerHTML=result;
        }
        if(this.showData.length < 1 && this._testStartus){
            //未输入地址
            document.getElementById("dialogDetails").innerHTML="<p>请输入地址</p>";
        }
        if(!this._testStartus){
            //测试失败
            document.getElementById("dialogDetails").innerHTML="<p>测试失败，请检查输入地址</p>";
        }
    },
    createData: function() {
        //以M为单位
        var _string = "A"
            //1M
        for(var i = 0; i < 20; i++) {
            _string = _string + _string;
        }
        return _string;
    }
}
$(document).ready(function() {
    //按钮绑定
    $("#IpAddress").on('keypress',function(event){
        if(event.keyCode=="13"){
            $("#getSpeed").trigger('click');
        }
    });
    test.getSpeed("getSpeed");
});