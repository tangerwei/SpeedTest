//存放测试下载地址 和上传地址
var config={
    //地址配置
    //IP:null,
    //post:null,
    host:null,
    path:"netdisk-tew2",
    files:["download1.zip","download2.zip","download3.zip","download4.zip"],
    //当前输入网址下的URL
    downloadUrls:[],
    uploadUrl:"",
    address:null,
    setUrl:function(inputId){
        this.host=$("#"+inputId).val();
        if(this.host.indexOf("http://")<0){
            this.address="http://"+this.host+"/"+this.path;
        }else{
            this.address=this.host+"/"+this.path;
        }
        this.downloadUrls=[];
        this.uploadUrl="";
    },
    getUrl:function(){
        if(!this.host){
            this.downloadUrls=[];
            this.uploadUrl="";
            return;
        }
        //获取下载地址
        for(var i=0;i<this.files.length;i++){
            var _url=this.address+"/"+this.files[i];
            this.downloadUrls.push(_url);
        }
        //设置上传地址
        this.uploadUrl="http://10.50.8.226:8082/mcu";
        //this.uploadUrl=this.address;
    }
}
