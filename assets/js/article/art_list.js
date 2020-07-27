$(function () {
  var layer = layui.layer
  var form = layui.form
  var laypage = layui.laypage;

  // 定义一个查询的参数对象，将来请求数据的时候
  // 需要将请求参数对象提交到服务器
  var q = {
    pagenum: 1,//页码值，默认请求第一页的数据
    pagesize: 2,//每页显示几条数据，默认每页显示2条
    cate_id: '',//文章分类的Id
    state: '' //文章发布状态
  }

  initTable()
  initCate()


  // 获取文章列表数据的方法
  function initTable () {
    $.ajax({
      method: 'GET',
      url: '/my/article/list',
      data: q,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('文章列表获取失败')
        }

        // 使用模板引擎渲染页面的数据
        var htmlStr = template('tpl-table', res);
        $('tbody').html(htmlStr)
        // 调用渲染分页的方法
        renderPage(res.total)
        // console.log(htmlStr)
        // console.log(res)
      }
    })
  }


  // 初始化文章分类的方法
  function initCate () {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取分类数据失败')
        }
        // 调用模板引擎渲染分类的可选项
        var htmlStr = template('tpl-cate', res)

        $('[name=cate_id]').html(htmlStr)
        // 通知layui重新渲染表单区域的UI结构
        form.render()
      }
    })
  }

  // 为筛选表单绑定submit事件
  $('#form-search').on('submit', function (e) {
    e.preventDefault()
    // 获取表单中选中项的值
    var cate_id = $('[name=cate_id]').val();
    var state = $('[name=state]').val();
    // 为查询参数对象q中对应的属性赋值
    q.cate_id = cate_id;
    q.state = state;
    // 根据最新的筛选条件，重新渲染表格的数据
    initTable()

  })

  // 定义渲染分页的方法
  function renderPage (total) {
    // 调用laypage.render渲染分页结构
    laypage.render({
      elem: 'pageBox', //分页容器的ID
      count: total, //数据总数
      limit: q.pagesize,//每页显示几条数据
      curr: q.pagenum, //指定默认被选中的分页
      limits: [2, 3, 5, 10],
      layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
      // 分页发生的时候触发jump回调
      jump: function (obj, first) {
        // 把最新的页码值赋值到q
        q.pagenum = obj.curr;
        // 把最新的条目数赋值到q里面的pagesize
        q.pagesize = obj.limit;
        // 根据最新的q获取对应的数据列表，并渲染表格
        // initTable() //会进入死循环，无法满足我们的需求
        if (!first) {
          initTable()
        }
      }
    });
  }

  // 通过代理的形式，为删除按钮绑定点击事件处理函数
  $('tbody').on('click', '.btn-delete', function () {
    // 获取页面上所有的删除按钮的个数
    var len = $('.btn-delete').length
    // 获取文章id
    var id = $(this).attr('data-id')
    // 询问用户是否要删除数据
    layer.confirm('确认删除？', { icon: 3, title: '提示' }, function (index) {
      //do something
      $.ajax({
        method: 'GET',
        url: '/my/article/delete/' + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg('删除文章失败')
          }
          layer.msg('删除文章成功')

          // 当数据删除完成后，需要判断这一页中是否还有剩余的数据
          // 如果没有剩余的数据，则需要对页码值 - 1，重新调用initTable方法
          if (len === 1) {
            // 如果len的值等于1，证明删除完毕后，页面上就没有任何数据
            q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1

          }
          initTable()
        }

      })
      layer.close(index);
    });
  })
})