export default defineAppConfig({
  pages: [
    'pages/stores/index',
    'pages/inspection/index',
    'pages/rectification/index',
    'pages/sales/index',
    'pages/performance/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '智慧零售巡查',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/stores/index',
        text: '今日门店'
      },
      {
        pagePath: 'pages/inspection/index',
        text: '拍照巡查'
      },
      {
        pagePath: 'pages/rectification/index',
        text: '问题整改'
      },
      {
        pagePath: 'pages/sales/index',
        text: '销量备注'
      },
      {
        pagePath: 'pages/performance/index',
        text: '个人绩效'
      }
    ]
  }
})
