$(function(){
    var form = layui.form

    form.verify({
        nickname: function(value){
            if(value.lenght > 6){
                return layer.msg('昵称长度需要再1~6个字符之间')
            }
        }
    })


    initUserInfo()

    // 初始化用户的基本信息
    function initUserInfo(){
        $.ajax({
            method: 'GET',
            url:'/my/userinfo',
            success:function(res){
                if(res.status !== 0 ){
                    return layer.msg('获取用户信息失败')
                }
                console.log(res.data.data)
                // 调用 form.val() 快速为表单赋值
                form.val('formUserInfo', res.data)
            }
        })
    }

    // 重置表单数据
    $('#btnReset').on('click',function(e){
        // 阻止默认重置行为
        e.preventDefault()
        initUserInfo()
    })


    // 监听表单提交事件
    $('.layui-form').on('submit',function(e){
        // 阻止表单提交行为
        e.preventDefault()
        // 发起 ajax 数据请求
        $.ajax({
            method: 'POST',
            url: '/my/userinfo',
            data: $(this).serialize(),
            success:function(res){
                if(res.status !== 0){
                    return layer.msg('更新用户信息失败')
                }
                layer.msg('更新用户信息成功！')
                // 调用父页面中的方法，重新渲染用户头像和信息
                window.parent.getUserInfo()
            }
        })

    })

})